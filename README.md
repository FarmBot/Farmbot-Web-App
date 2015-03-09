[![Code Climate](https://codeclimate.com/github/FarmBot/farmbot-web-app.png)](https://codeclimate.com/github/FarmBot/farmbot-web-app)
[![Build Status](https://travis-ci.org/FarmBot/farmbot-web-app.svg)](https://travis-ci.org/FarmBot/farmbot-web-app)
[![Test Coverage](https://codeclimate.com/github/FarmBot/farmbot-web-app/badges/coverage.svg)](https://codeclimate.com/github/FarmBot/farmbot-web-app)# Farmbot Web App

This Repo is the Web based side of FarmBot. It allows users to control the device from their web browser. **ITS NOT STABLE. WE ARE IN PRE ALPHA.**

# Developer setup

 1. `git clone git@github.com:FarmBot/farmbot-web-app.git`
 2. `cd farmbot-web-app`
 3. [Install MongoDB](http://docs.mongodb.org/manual/tutorial/install-mongodb-on-os-x/)
 4. Start Mongo if you have not already done so. (typically via the `mongod` command)
 3. `bundle install`
 4. `rails s`
 5. Go to `http://localhost:3000`

# Running Tests

Please run them before submitting pull requests.

## Ruby Specs

 * `bundle exec rspec spec`

## Javascript Specs

 * ` bundle exec rake spec:javascript`

# How to Contribute

 * Check out [Waffle.io](https://waffle.io/farmbot/farmbot-web-app) for issues that are ready to be worked on.
 * Pull requests are always appreciated, but *please*
   * Write tests.
   * Follow the [Ruby Community Style Guide](https://github.com/bbatsov/ruby-style-guide).
   * Raise issues. We love to know about issues. Even the issues you think are only relevant to your setup. Just submit issues if you have issues.

# Roadmap

This project is still in its infancy. Our current focus as of July 2014 is to create a basic system of control for the farmbot user via technologies such as:

 * [Farmbot Controller](https://github.com/FarmBot/farmbot-raspberry-pi-controller)
 * [MeshBlu IoT Messaging Platform](http://www.skynet.im) ([Github](https://github.com/skynetim/skynet))
 * Ruby on Rails

Eventually, the app hopes to be a rich environment for users to manage their FarmBot and gain insights into the farming decision process.

# nice-to-haves

 * Actually make use of MeshBlu response objects, instead of just screaming commands at the device.
 * Display device status.
 * Test precision control widget on device.
 * Dropdown box to select device (defaults to first)
 * Better test suite for angular side of things.

# Accomplishments

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
