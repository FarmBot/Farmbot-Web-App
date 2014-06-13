[![Stories in Ready](https://badge.waffle.io/farmbot/farmbot-web-backend.png?label=ready&title=Ready)](https://waffle.io/FarmBot/farmbot-web-app)

[![Code Climate](https://codeclimate.com/github/FarmBot/farmbot-web-app.png)](https://codeclimate.com/github/FarmBot/farmbot-web-app)

# Farmbot Web App

This Repo is the Web based side of FarmBot. It is the glue that ties together all other farmbot components and services. **ITS NOT STABLE. WE ARE IN PRE ALPHA.**

# Developer setup

 1. `git clone git@github.com:FarmBot/farmbot-web-backend.git`
 2. `cd farmbot-web-backend`
 3. [Install MongoDB](http://docs.mongodb.org/manual/tutorial/install-mongodb-on-os-x/)
 4. Start Mongo if you have not already done so. (typically via the `mongod` command)
 3. `bundle install`
 4. `rails s`
 5. Go to `http://localhost:3000`

# How to Contribute

 * Check out [Waffle.io](https://waffle.io/farmbot/farmbot-web-backend) for issues that are ready to be worked on.
 * Pull requests are always appreciated, but *please*
   * Write tests.
   * Follow the [Ruby Community Style Guide](https://github.com/bbatsov/ruby-style-guide).
   * Raise issues. We love to know about issues.

# Roadmap

This project is still in its infancy. Our current focus as of June 2014 is to create a basic system of control for the farmbot user via technologies such as:

 * [Farmbot Controller](https://github.com/FarmBot/farmbot-raspberry-pi-controller)
 * [Skynet IoT Messaging Platform](http://www.skynet.im) ([Github](https://github.com/skynetim/skynet))
 * Ruby on Rails

Eventually, the DSS hopes to be a rich environment for users to manage their FarmBot and gain insights into the farming decision process.

# Accomplishments

APRIL 2014:

 * Finished basic user registration
 * Functional mockups

MAY 2014:

 * Deployed pre-alpha staging server (contact Rick Carlino for contributor access)
 * Connected to [SkyNet](www.skynet.im)
 * Finished in browser device config for skynet.

JUNE 2014:

 * Achieved Device movement in the real world.
 * More to come...