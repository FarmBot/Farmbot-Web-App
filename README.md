[![Code Climate](https://codeclimate.com/github/FarmBot/farmbot-web-app.png)](https://codeclimate.com/github/FarmBot/farmbot-web-app)
[![Build Status](https://travis-ci.org/FarmBot/farmbot-web-app.svg)](https://travis-ci.org/FarmBot/farmbot-web-app)
[![Test Coverage](https://codeclimate.com/github/FarmBot/farmbot-web-app/badges/coverage.svg)](https://codeclimate.com/github/FarmBot/farmbot-web-app)

# STOP!! You might not need this!

This repo is intended for developers who build the [Farmbot Web App](http://my.farmbot.io/). **If you are not a developer**, you are highly encouraged to use [the publicly available web app](http://my.farmbot.io/).

If you are a developer interested in contributing or would like to provision your own server, you are in the right place.

# Farmbot Web App

This Repo is the Web based side of FarmBot. It allows users to control the device from their web browser. **We're getting closer to launch, but it this is an unstable pre-alpha repo.**

# Developer setup

 1. `git clone git@github.com:FarmBot/farmbot-web-app.git`
 2. `cd farmbot-web-app`
 3. [Install MongoDB](http://docs.mongodb.org/manual/tutorial/install-mongodb-on-os-x/)
 4. Start Mongo if you have not already done so. (typically via the `mongod` command)
 3. `bundle install`
 4. `rails s`
 5. Go to `http://localhost:3000`

**We can't fix issues we don't know about.** Please submit an issue if you are having trouble installing on your local machine.

## Running Specs

Please run them before submitting pull requests.

 * `bundle exec rspec spec`

# How to Contribute

 * Pull requests are always appreciated, but *please*
   * Write tests.
   * Follow the [Ruby Community Style Guide](https://github.com/bbatsov/ruby-style-guide).
   * Raise issues. We love to know about issues. Even the issues you think are only relevant to your setup. Just submit issues if you have issues.

# Roadmap

As of July 2015, the Web App supports scheduling and manual movemnt of FarmBot via the browser.

Eventually, the app hopes to be a rich environment for users to manage their FarmBot and gain insights into the farming decision process.

# nice-to-haves

 * Actually make use of MeshBlu response objects (with timeouts), instead of just screaming commands at the device.
 * Better test suite for angular side of things.

# Accomplishments

July 2015:

 * 1.0 release candidate.
 * Full manual control of device via browser.
 * Scheduling of sequences and commands.

JULY 2014:

 * Changed UI Components
 * MeshBlu upgrade
 * Production server changes

JUNE 2014:

 * Achieved Device movement in the real world.

MAY 2014:

 * Deployed pre-alpha staging server (contact Rick Carlino for contributor access)
 * Connected to [MeshBlu](http://www.skynet.im/), formerly SkyNet.
 * Finished in browser device config for skynet.

APRIL 2014:

 * Finished basic user registration
 * Functional mockups
