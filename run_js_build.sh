#!/bin/sh

# Avoid the Docker setup/teardown cost by running all build tasks in one file.
npm run tslint
npm run sass-lint
npm run typecheck
npm run test-slow
npm run coverage
