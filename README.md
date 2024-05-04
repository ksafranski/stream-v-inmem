# Stream v. In Mem Profiler

A very basic example of the difference between running an in-memory process
vs. streaming data. Both scripts read a JSON file and convert it to a CSV file.
The JSON file consists of 100,000 records with keys `a`-`z` with random values.

Whereas with in-memory processing, the entire JSON file is read into memory and
then processed, the streaming process reads the JSON file line-by-line and then
processes the data. This means that not only is the memory footprint smaller and
more consistent, but the processing time is also significantly faster.

Additionally the streaming process is more efficient in terms of CPU time, as
it is able to process the data more quickly than the in-memory process.

With streaming the pipeline is able to be controlled throughout the process,
being able to apply backpressure to the data source, slowing things down or
speeding things up to respond to the data coming in from a source, or pressure
coming from the destination.

## Usage

Install the dependencies with `yarn` then run the two processes to compare the
performance with `yarn profile:inmem` and `yarn profile:stream`.

## Results

From testing the two methods for processing data, the stream is significantly
more performant than the in-memory process:

```
┌──────────────────┬─────────────────┬───────────────┬───────────────────┐
| Metric           | In-Memory       | Streaming     | Perf Increase (%) |
| ---------------- | --------------- | ------------- | ----------------- |
| Execution Time   |   697 ms        |   343 ms      |   +50.79%         |
| CPU Time         |   2350 ms       |   660 ms      |   +71.91%         |
| Memory Allocated |   860.84 MB     |   301.72 MB   |   +64.96%         |
| Heap Total       |   670.25 MB     |   186.2 MB    |   +72.23%         |
| Memory Used      |   631.73 MB     |   153.47 MB   |   +75.70%         |
└──────────────────┴─────────────────┴───────────────┴───────────────────┘
```
