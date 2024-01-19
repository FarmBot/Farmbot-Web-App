#!/bin/sh

sudo docker compose run web npm run linters   &
P1=$!

sudo docker compose run web rspec spec        &
P2=$!

sudo docker compose run web npm run test-slow &
P3=$!

wait $P1 $P2 $P3
