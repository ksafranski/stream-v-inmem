import { promises as fs } from "fs";
import { startProfiling, outputReport } from "./profiler";

/**
 * Converts a JSON array to a CSV string.
 */
const JSONToCSV = (json: any[]): string => {
  const csv = json
    .map((obj: Record<string, any>) => Object.values(obj).join(","))
    .join("\n");
  return csv;
};

const main = async (): Promise<void> => {
  // Start profiling the memory usage
  startProfiling();

  // Read the entire JSON file into memory
  const data = await fs.readFile("data.json", "utf8");

  // Parse the JSON data into an array of objects
  const json = JSON.parse(data);

  // Convert the JSON data to a CSV string
  const csv = JSONToCSV(json);

  // Write the CSV string to a file
  await fs.writeFile("output.csv", csv as string);

  // Output the report to console
  outputReport();
};

main();
