[![Stories in Ready](https://badge.waffle.io/farmbot/farmbot-web-backend.png?label=ready&title=Ready)](https://waffle.io/farmbot/farmbot-dss)
[![Code Climate](https://codeclimate.com/github/FarmBot/farmbot-dss.png)](https://codeclimate.com/github/FarmBot/farmbot-dss)

# Farmbot Decision Support System

This Repo is the Web based side of the decision support system. It is the glue that ties together all other farmbot components and services.

# Developer setup

 1. `git clone git@github.com:FarmBot/farmbot-web-backend.git`
 2. `cd farmbot-web-backend`
 3. `bundle install`
 4. `rails s`
 5. Checkout `http://localhost:3000`

# How to Contribute

 * Check out [Waffle.io](https://waffle.io/farmbot/farmbot-web-backend) for issues that are ready to be worked on.
 * Pull requests are always appreciated, but *please do write tests* for your contribuitions- this project is the work of many people. Having a good test suite keeps it maintainable.

# Roadmap

This project is still in its infancy. Our current focus as of March 2014 is to create a basic system of control for the farmbot user via technologies such as:

 * [Farmbot Controller](https://github.com/FarmBot/farmbot-raspberry-pi-controller)
 * [Skynet IoT Messaging Platform](http://www.skynet.im) ([Github](https://github.com/skynetim/skynet))
 * Ruby on Rails

Eventually, the DSS hopes to be a rich environment for users to manage their FarmBot and gain insights into the farming decision making process.
