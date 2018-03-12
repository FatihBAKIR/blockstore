#!/bin/bash
set +x

echo "BS A 100"
node ycsb_bs.js run -P workloada -p operationcount=100 -p num_worker=8 > bs_100_a.txt
echo "BS A 1000"
node ycsb_bs.js run -P workloada -p operationcount=1000 -p num_worker=8 > bs_1000_a.txt
echo "BS A 10000"
node ycsb_bs.js run -P workloada -p operationcount=10000 -p num_worker=8 > bs_10000_a.txt

echo "BS B 100"
node ycsb_bs.js run -P workloadb -p operationcount=100 -p num_worker=8 > bs_100_b.txt
echo "BS B 1000"
node ycsb_bs.js run -P workloadb -p operationcount=1000 -p num_worker=8 > bs_1000_b.txt
echo "BS B 10000"
node ycsb_bs.js run -P workloadb -p operationcount=10000 -p num_worker=8 > bs_10000_b.txt

echo "BS C 100"
node ycsb_bs.js run -P workloadc -p operationcount=100 -p num_worker=8 > bs_100_c.txt
echo "BS C 1000"
node ycsb_bs.js run -P workloadc -p operationcount=1000 -p num_worker=8 > bs_1000_c.txt
echo "BS C 10000"
node ycsb_bs.js run -P workloadc -p operationcount=10000 -p num_worker=8 > bs_10000_c.txt