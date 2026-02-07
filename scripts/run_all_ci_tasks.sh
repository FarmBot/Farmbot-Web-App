#!/bin/sh

sudo docker compose run web bun run linters   &
P1=$!

sudo docker compose run web rspec spec        &
P2=$!

sudo docker compose run web bun run test &
P3=$!

wait $P1 $P2 $P3
