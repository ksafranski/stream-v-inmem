const { parentPort } = require("worker_threads");

parentPort.on("message", (jsonObj) => {
  // Example processing: reverse the values if they are strings.
  const processed = Object.fromEntries(
    Object.entries(jsonObj).map(([key, value]) => [
      key,
      typeof value === "string" ? value.split("").reverse().join("") : value,
    ])
  );
  parentPort.postMessage(processed);
});
