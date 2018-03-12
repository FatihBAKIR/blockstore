#!/bin/bash
set +x

echo "Mongo A 100"
node ycsb.js run -P workloada -p operationcount=100 -p num_worker=8 > mongo_100_a.txt
echo "Mongo A 500"
node ycsb.js run -P workloada -p operationcount=500 -p num_worker=8 > mongo_500_a.txt
echo "Mongo A 1000"
node ycsb.js run -P workloada -p operationcount=1000 -p num_worker=8 > mongo_1000_a.txt
echo "Mongo A 5000"
node ycsb.js run -P workloada -p operationcount=5000 -p num_worker=8 > mongo_5000_a.txt
echo "Mongo A 10000"
node ycsb.js run -P workloada -p operationcount=10000 -p num_worker=8 > mongo_10000_a.txt

echo "Mongo B 100"
node ycsb.js run -P workloadb -p operationcount=100 -p num_worker=8 > mongo_100_b.txt
echo "Mongo B 500"
node ycsb.js run -P workloadb -p operationcount=500 -p num_worker=8 > mongo_500_b.txt
echo "Mongo B 1000"
node ycsb.js run -P workloadb -p operationcount=1000 -p num_worker=8 > mongo_1000_b.txt
echo "Mongo B 5000"
node ycsb.js run -P workloadb -p operationcount=5000 -p num_worker=8 > mongo_5000_b.txt
echo "Mongo B 10000"
node ycsb.js run -P workloadb -p operationcount=10000 -p num_worker=8 > mongo_10000_b.txt

echo "Mongo C 100"
node ycsb.js run -P workloadc -p operationcount=100 -p num_worker=8 > mongo_100_c.txt
echo "Mongo C 500"
node ycsb.js run -P workloadc -p operationcount=500 -p num_worker=8 > mongo_500_c.txt
echo "Mongo C 1000"
node ycsb.js run -P workloadc -p operationcount=1000 -p num_worker=8 > mongo_1000_c.txt
echo "Mongo C 5000"
node ycsb.js run -P workloadc -p operationcount=5000 -p num_worker=8 > mongo_5000_c.txt
echo "Mongo C 10000"
node ycsb.js run -P workloadc -p operationcount=10000 -p num_worker=8 > mongo_10000_c.txt
