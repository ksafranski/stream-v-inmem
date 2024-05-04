import { createReadStream, createWriteStream } from "fs";
import { Transform, TransformOptions } from "stream";
import { startProfiling, outputReport } from "./profiler";
class JSONStreamParser extends Transform {
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

        const jsonStr = data.substring(startIndex, endIndex);
        const jsonObj = JSON.parse(jsonStr);
        this.push(jsonObj); // Emit the parsed object

        lastIndex = endIndex;
        startIndex = data.indexOf("{", endIndex);
      }

      // Save any incomplete data to be processed with the next chunk
      this.remainder = data.substring(lastIndex);
      callback();
    } catch (error) {
      callback(error);
    }
  }

  _flush(callback: (error?: Error | null) => void): void {
    if (this.remainder) {
      // Attempt to process any remaining data at the end of the stream
      try {
        const jsonObj = this.remainder;
        this.push(jsonObj); // Emit the final object
        this.remainder = "";
        callback();
      } catch (error) {
        callback(error);
      }
    } else {
      callback();
    }
  }
}

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
    } catch (error) {
      callback(error);
    }
  }

  _flush(callback: (error?: Error | null) => void): void {
    callback();
  }
}

const BUFFER_SIZE = 1024 * 1024;

const main = async () => {
  startProfiling();
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
  readStream
    .pipe(jsonStreamParser)
    .pipe(objectToCSVTransformer)
    .pipe(writeStream);
  writeStream.on("finish", () => {
    outputReport();
  });
};

main();
