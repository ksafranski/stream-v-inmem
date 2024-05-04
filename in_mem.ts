import { toCsv } from "@iwsio/json-csv-node";
import { promises as fs } from "fs";
import { startProfiling, outputReport } from "./profiler";

const JSONToCSV = (json) => {
  const csv = json.map((obj) => Object.values(obj).join(",")).join("\n");
  return csv;
};

const main = async () => {
  startProfiling();
  const data = await fs.readFile("data.json", "utf8");
  const json = JSON.parse(data);
  const csv = JSONToCSV(json);
  await fs.writeFile("output.csv", csv as string);
  outputReport();
};

main();
