import { createReadStream, createWriteStream } from "fs";
import { Transform, TransformOptions } from "stream";
import { startProfiling, outputReport } from "./profiler";

// NOTE: In reality this file should be split into libs

/**
 * ----------------------------------------------
 * JSONStreamParser (abstract to another file)
 * Streams JSON, parses, and converts to objects
 * ----------------------------------------------
 */

class JSONStreamParser extends Transform {
  // Store any incomplete JSON object from the last chunk
  private remainder: string = "";

  constructor(options?: TransformOptions) {
    super({
      ...options,
      readableObjectMode: true, // Output objects rather than strings/buffers
    });
  }

  _transform(
    chunk: Buffer,
    encoding: string,
    callback: (error?: Error | null, data?: any) => void
  ): void {
    // Combine the remainder of the last chunk with the current chunk
    let data = this.remainder + chunk.toString();
    let lastIndex = 0;

    try {
      // Process each complete JSON object in the chunk
      let startIndex = data.indexOf("{");
      while (startIndex !== -1) {
        let endIndex = data.indexOf("}", startIndex);
        if (endIndex === -1) {
          break; // End of the complete object not found, wait for more data
        }
        endIndex++; // Include the closing brace

        // Parse the JSON object
        const jsonObj = JSON.parse(data.substring(startIndex, endIndex));
        this.push(jsonObj); // Emit the parsed object

        lastIndex = endIndex;
        startIndex = data.indexOf("{", endIndex);
      }

      // Save any incomplete data to be processed with the next chunk
      this.remainder = data.substring(lastIndex);
      callback();
    } catch (error: Error | any) {
      callback(error);
    }
  }

  _flush(callback: (error?: Error | null) => void): void {
    if (this.remainder) {
      // Attempt to process any remaining data at the end of the stream
      try {
        this.push(this.remainder); // Emit the final object
        this.remainder = "";
        callback();
      } catch (error: Error | any) {
        callback(error);
      }
    } else {
      callback();
    }
  }
}

/**
 * ----------------------------------------------
 * ObjectToCSVTransformer (abstract to another file)
 * Converts objects to CSV format and pushes to
 * the output stream.
 * ----------------------------------------------
 */
class ObjectToCSVTransformer extends Transform {
  private isFirstLine: boolean = true;
  public ignoreHeader: boolean = false;

  constructor(
    options?: TransformOptions,
    outputOptions?: { ignoreHeader: boolean }
  ) {
    super({
      ...options,
      writableObjectMode: true, // Accept objects from the input stream
      readableObjectMode: false, // Emit strings (CSV lines),
    });
    this.ignoreHeader = outputOptions?.ignoreHeader ?? false;
  }

  _transform(
    obj: any,
    encoding: string,
    callback: (error?: Error | null, data?: any) => void
  ): void {
    if (this.isFirstLine) {
      // Extract headers from the first object keys if not already set
      if (!this.ignoreHeader) {
        this.push(Object.keys(obj).join(",") + "\n"); // Emit the header line
        this.isFirstLine = false;
      }
    }

    try {
      this.push(Object.values(obj).join(",") + "\n"); // Emit the CSV line
      callback();
    } catch (error: Error | any) {
      callback(error);
    }
  }

  _flush(callback: (error?: Error | null) => void): void {
    callback();
  }
}

/**
 * ----------------------------------------------
 * Main is called and creates the read streams,
 * pipes through the JSONStreamParser and
 * ObjectToCSVTransformer, and writes the output
 * to a CSV file.
 * ----------------------------------------------
 */
const main = async (): Promise<void> => {
  // Set the buffer size to 1MB
  const BUFFER_SIZE = 1024 * 1024;
  // Start profiling the memory usage
  startProfiling();

  // Create the read stream, JSON parser, CSV transformer, and write stream
  const readStream = createReadStream("data.json", {
    highWaterMark: BUFFER_SIZE,
  });
  const jsonStreamParser = new JSONStreamParser({ highWaterMark: BUFFER_SIZE });
  const objectToCSVTransformer = new ObjectToCSVTransformer(
    {
      highWaterMark: BUFFER_SIZE,
    },
    { ignoreHeader: true }
  );
  const writeStream = createWriteStream("output.csv", {
    highWaterMark: BUFFER_SIZE,
  });

  // Pipe the streams together and write the output to a CSV file
  readStream
    .pipe(jsonStreamParser)
    .pipe(objectToCSVTransformer)
    .pipe(writeStream);

  // Output the report after the write stream finishes
  writeStream.on("finish", () => {
    outputReport();
  });
};

main();
