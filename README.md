[![Code Climate](https://codeclimate.com/github/FarmBot/farmbot-web-app/badges/gpa.svg)](https://codeclimate.com/github/FarmBot/farmbot-web-app)
[![Test Coverage](https://codeclimate.com/github/FarmBot/farmbot-web-app/badges/coverage.svg)](https://codeclimate.com/github/FarmBot/farmbot-web-app)
[![Build Status](https://travis-ci.org/FarmBot/farmbot-web-app.svg)](https://travis-ci.org/FarmBot/farmbot-web-app)

# Do I need this?

This repository is intended for developers who build the [Farmbot Web App](http://my.farmbot.io/). **If you are not a developer**, you are highly encouraged to use [the publicly available web app](http://my.farmbot.io/).

If you are a developer interested in contributing or would like to provision your own server, you are in the right place.

# Farmbot Web App

**[LATEST STABLE VERSION IS HERE](https://github.com/FarmBot/farmbot-web-app/tree/dcf7cecf83d4b489ec55620f30614cc6b7c202f3)** :star: :star: :star:

This Repo is the Web based side of FarmBot. It allows users to control the device from their web browser. **We're getting closer to launch, but it this is an unstable pre-alpha repo.**

# Developer setup

 0. `git clone git@github.com:FarmBot/farmbot-web-app.git`
 0. `cd farmbot-web-app`
 0. [Install MongoDB](http://docs.mongodb.org/manual/tutorial/install-mongodb-on-os-x/)
 0. Start Mongo if you have not already done so. (typically via the `mongod` command)
 0. `bundle install`
 0. [Install node](https://nodejs.org/en/download/package-manager/)
 0. `sudo npm install gulp -g` if you don't have gulp installed already.
 0.  `npm install`
 0. `rails s`
 0. Go to `http://localhost:3000`

# Provisioning your own with Dokku

 0. Get a Dokku instance running. HINT: DigitalOcean offers one click images.
 0. Run `dokku plugin:install https://github.com/dokku/dokku-mongo.git mongo` on the server.
 0. Push the app to the dokku server
 0. dokku mongo:create web_app_staging
 0. (on server) `dokku mongo:link web_app_staging 00-default`


The frontend (and asset management) are very much in a transitional state. We're experimenting with Gulp as an alternative

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


# Accomplishments

July 2015:

 * 1.0 release candidate.
 * Full manual control of device via browser.
 * Scheduling of sequences and commands.

2014:

 * Changed UI Components
 * MeshBlu upgrade
 * Production server changes
 * Achieved Device movement in the real world.
 * Deployed pre-alpha staging server (contact Rick Carlino for contributor access)
 * Connected to [MeshBlu](http://www.skynet.im/), formerly SkyNet.
 * Finished in browser device config for skynet.
 * Finished basic user registration
 * Functional mockups
