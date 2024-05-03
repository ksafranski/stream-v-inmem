import { createReadStream, createWriteStream } from "fs";
import { toCsvStream } from "@iwsio/json-csv-node";
import { Transform } from "stream";
import { startProfiling, outputReport } from "./profiler";

/**
 * Create a transformer stream to clean non-alphanumeric characters from each line.
 */

const BUFFER_SIZE = 1024 * 1024;

const main = async () => {
  startProfiling();
  const readStream = createReadStream("data.json", {
    highWaterMark: BUFFER_SIZE,
  });
  const writeStream = createWriteStream("output.csv", {
    highWaterMark: BUFFER_SIZE,
  });
  readStream
    .pipe(
      toCsvStream({
        ignoreHeader: true,
      }) as Transform
    )
    .pipe(writeStream);
  writeStream.on("finish", () => {
    outputReport();
  });
};

main();
