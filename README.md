# FarmBot Web App
[![codebeat badge](https://codebeat.co/badges/7f81859b-67fe-4bdb-b56f-050bfed35e9c)](https://codebeat.co/projects/github-com-farmbot-farmbot-web-app-staging)
[![codecov](https://codecov.io/gh/FarmBot/Farmbot-Web-App/branch/master/graph/badge.svg)](https://codecov.io/gh/FarmBot/Farmbot-Web-App)
[![Coverage Status](https://coveralls.io/repos/github/FarmBot/Farmbot-Web-App/badge.svg)](https://coveralls.io/github/FarmBot/Farmbot-Web-App)
[![Maintainability](https://api.codeclimate.com/v1/badges/74091163d8a02bb8988f/maintainability)](https://codeclimate.com/github/FarmBot/Farmbot-Web-App/maintainability)


# Q: Do I need this?

This repository is intended for *software developers* who wish to modify the [Farmbot Web App](http://my.farmbot.io/). **If you are not a developer**, you are highly encouraged to use [the publicly available web app](http://my.farmbot.io/). Running a server is *a non-trivial task with security implications*. It requires an intermediate background in Ruby, SQL and Linux system administration.

If you are a developer interested in contributing or would like to provision your own server, you are in the right place.

# Q: Where do I report security issues?

We take security seriously and value the input of independent researchers. Please see our [responsible disclosure guidelines](https://farm.bot/responsible-disclosure-of-security-vulnerabilities/).

# Q: What is the Farmbot Web App?

This repo contains FarmBot's web based user interface, a RESTful JSON API and a Dockerized MQTT server. The API stores data such as user account information, plant data, authorization tokens and a variety of other resources. The MQTT server facilitates realtime messaging from the browser to the device.

# Q: Can I see some example API requests?

For a list of example API requests and responses, see our [reference documentation](https://gist.github.com/RickCarlino/10db2df375d717e9efdd3c2d9d8932af). If you wish to write an add-on application that uses the FarmBot API, please let us know in an issue. We are happy to answer any specific questions you may have.

# Q: How do I Setup an instance locally?

## Prerequisites

Installation requires an x86 desktop machine running a fresh installation of Ubuntu 18.

We **do not recomend running the server on a Raspberry Pi** due to issues with ARM compilation and memory usage. **Windows is not supported** at this time.

## Setup

A step-by-step setup guide for Ubuntu 18 can be found [here](https://github.com/FarmBot/Farmbot-Web-App/blob/master/ubuntu_example.sh). Installation on distributions other than Ubuntu is possible, but we do not provide installation support.

Installation was last tested against Ubuntu 18.04 in June of 2018. Please [Raise an issue](https://github.com/FarmBot/Farmbot-Web-App/issues/new?title=Installation%20Failure) if you hit problems with any of these steps. *We can't fix issues we don't know about.*

# Config Settings (important)

We try our best to follow the [12 Factor Methodology](https://12factor.net/). Part of that means using ENV variables as a means of [storing configuration](https://12factor.net/config). **Your server won't run without setting ENV variables first**.

You can accomplish this by setting the ENV variables directly from your shell / server management tool or by writing an `application.yml` file.

See `config/application.example.yml` for a list of all the variables that must be set.

**Encryption keys**: Encryption keys will be auto-generated if not present. They can be reset using `rake keys:generate`. If `ENV['RSA_KEY']` is set, it will be used in place of the `*.pem` files. Useful for environments like Heroku, where file system access is not allowed.

# Want to Help?

[Low Hanging Fruit](https://github.com/FarmBot/Farmbot-Web-App/search?utf8=%E2%9C%93&q=todo). [Raise an issue](https://github.com/FarmBot/Farmbot-Web-App/issues/new?title=Question%20about%20a%20TODO) if you have any questions.

## Translating the web app into your language

Thanks for your interest in internationalizing the FarmBot web app! To add translations:

1. Fork this repo
0. Navigate to `/public/app-resources/languages` and run the command `node _helper.js yy` where `yy` is your language's [language code](http://www.science.co.il/Language/Locale-codes.php). Eg: `ru` for Russian.
0. Edit the translations in the file created in the previous step: `"phrase": "translated phrase"`.
0. When you have updated or added new translations, commit/push your changes and submit a pull request.
