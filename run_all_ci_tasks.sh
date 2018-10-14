#!/bin/sh

sudo docker-compose run web npm run tslint    &
P1=$!

sudo docker-compose run web npm run sass-lint &
P2=$!

sudo docker-compose run web npm run typecheck &
P3=$!

sudo docker-compose run web rspec spec        &
P4=$!

sudo docker-compose run web npm run test-slow &
P5=$!

sudo docker-compose run web npm run coverage  &
P6=$!

wait $P1 $P2 $P3 $P4 $P5 $P6
