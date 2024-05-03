# Stream v. In Mem Profiler

A very basic example of the difference between running an in-memory process
vs. streaming data. Both scripts read a JSON file and convert it to a CSV file.
The JSON file consists of 100,000 records with keys `a`-`z` with random values.

## Usage

Install the dependencies with `yarn` then run the two processes to compare the
performance with `yarn profile:inmem` and `yarn profile:stream`.

## Results

Example results from testing:

### In Memory

```
┌──────────────────┬─────────────┐
│ (index)          │ Values      │
├──────────────────┼─────────────┤
│ Execution Time   │ '400 ms'    │
│ CPU Time         │ '1180 ms'   │
│ Memory Allocated │ '616.89 MB' │
│ Heap Total       │ '519.41 MB' │
│ Memory Used      │ '486.31 MB' │
└──────────────────┴─────────────┘
```

### Stream

```
┌──────────────────┬─────────────┐
│ (index)          │ Values      │
├──────────────────┼─────────────┤
│ Execution Time   │ '33 ms'     │
│ CPU Time         │ '110 ms'    │
│ Memory Allocated │ '287.41 MB' │
│ Heap Total       │ '131.03 MB' │
│ Memory Used      │ '92.83 MB'  │
└──────────────────┴─────────────┘
```
