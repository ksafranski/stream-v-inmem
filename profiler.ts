import { CpuInfo, cpus as getCpus } from "os";

const mem = { startTime: 0, initCPU: 0 };

function calculateCPUTime(cpus: CpuInfo[]): number {
  return cpus.reduce((total, { times }) => total + times.user + times.sys, 0);
}

export const startProfiling = (): void => {
  mem.startTime = Date.now();
  mem.initCPU = calculateCPUTime(getCpus());
};

export const outputReport = (): void => {
  // Calculate the end time and CPU times
  const endTime = Date.now();
  const finalCPUTime = calculateCPUTime(getCpus());

  // Calculate the total elapsed CPU and wall-clock time
  const cpuTimeUsed = finalCPUTime - mem.initCPU;

  // Format to MBs
  const formatMemoryUsage = (data) =>
    `${Math.round((data / 1024 / 1024) * 100) / 100} MB`;

  // Get memory usage data
  const memoryData = process.memoryUsage();

  const memoryUsage = {
    "Execution Time": `${endTime - mem.startTime} ms`,
    "CPU Time": `${cpuTimeUsed} ms`,
    "Memory Allocated": `${formatMemoryUsage(memoryData.rss)}`,
    "Heap Total": `${formatMemoryUsage(memoryData.heapTotal)}`,
    "Memory Used": `${formatMemoryUsage(memoryData.heapUsed)}`,
  };

  console.table(memoryUsage);
};
