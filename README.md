# FarmBot Web App
[![codebeat badge](https://codebeat.co/badges/7f81859b-67fe-4bdb-b56f-050bfed35e9c)](https://codebeat.co/projects/github-com-farmbot-farmbot-web-app-staging)
[![codecov](https://codecov.io/gh/FarmBot/Farmbot-Web-App/branch/master/graph/badge.svg)](https://codecov.io/gh/FarmBot/Farmbot-Web-App)
[![Coverage Status](https://coveralls.io/repos/github/FarmBot/Farmbot-Web-App/badge.svg)](https://coveralls.io/github/FarmBot/Farmbot-Web-App)
[![Maintainability](https://api.codeclimate.com/v1/badges/74091163d8a02bb8988f/maintainability)](https://codeclimate.com/github/FarmBot/Farmbot-Web-App/maintainability)


😎:new: [Documentation to help software developers write add-ons and plugins for FarmBot](https://developer.farm.bot/docs)👀

# Q: Do I need this?

**End users should not run this software**.

There are only a handful of use cases where running a third party server is advisable:

 * Development of new features, bug fixes and pull requests.
 * Independent security research and auditing.

FarmBot, Inc. provides a publicly accessible server at [https://my.farm.bot/](https://my.farm.bot/) for end users that are not familiar with Ruby on Rails application development. Hosting your own server will require an understanding of how Ruby on Rails applications (and databases) operate. It is designed for use by software engineers. Self-hosting the Web App will not provide you with a more stable user experience and may result in accidental security issues or data loss.

**If you are not a Ruby on Rails developer**, or you have never written a Ruby on Rails application, you are encouraged to use [the publicly available web app](http://my.farmbot.io/). Running a server is *a non-trivial task with security implications*. Data loss and security issues are possible in some circumstances. Self hosting requires an intermediate background in Ruby, SQL and Linux system administration.

We do not have the resources available to help novice developers learn to setup servers, environments, configurations, or perform basic Linux command line instructions.

# Q: Where do I report security issues?

We take security seriously and value the input of independent researchers. Please see our [responsible disclosure guidelines](https://farm.bot/responsible-disclosure-of-security-vulnerabilities/).

# Q: What is the Farmbot Web App?

This repo contains FarmBot's web based user interface, a RESTful JSON API and a Dockerized MQTT server. The API stores data such as user account information, plant data, authorization tokens and a variety of other resources. The MQTT server facilitates realtime messaging from the browser to the device.

# Q: Can I see some example API requests?

For a list of example API requests and responses, see our [reference documentation](https://gist.github.com/RickCarlino/10db2df375d717e9efdd3c2d9d8932af). If you wish to write an add-on application that uses the FarmBot API, please let us know in an issue. We are happy to answer any specific questions you may have.

# Q: How do I Setup an instance locally?

If you are not a software developer with Ruby on Rails experience, you should not set up a server. Data loss and security vulnerabilities are possible.

We provide example setup instructions for software developers running Ubuntu 18 [here](https://github.com/FarmBot/Farmbot-Web-App/blob/master/ubuntu_example.sh).

Installation was last tested against Ubuntu 18.04 in October of 2018 on an x86 based machine.

Our ability to help individual users with private setup is limited. Using the public server at http://my.farm.bot is the recommended setup for end users. Please see the top of this document for more information.

# Config Settings (important)

We follow the [12 Factor Methodology](https://12factor.net/). As such, ENV variables are the primary means of [storing configuration](https://12factor.net/config). **Your server won't run without setting ENV variables first**.

You can accomplish this by setting the ENV variables directly from your shell / server management tool or by writing an `.env` file in server's base directory.

See `example.env` for a list of all the variables that must be set.

**Encryption keys**: Encryption keys will be auto-generated if not present. They can be reset using `rake keys:generate`. If `ENV['RSA_KEY']` is set, it will be used in place of the `*.pem` files. This is useful for environments like Heroku and Docker, where file system access is not allowed.

# Translating the Web App into Your Language

Thanks for your interest in internationalizing the FarmBot web app! To add translations:

1. Fork this repo
0. Navigate to `/public/app-resources/languages` and run the command `node _helper.js yy` where `yy` is your language's [language code](http://www.science.co.il/Language/Locale-codes.php). Eg: `ru` for Russian.
0. Edit the translations in the file created in the previous step: `"phrase": "translated phrase"`.
0. When you have updated or added new translations, commit/push your changes and submit a pull request.

# Want to Help?

[Low Hanging Fruit](https://github.com/FarmBot/Farmbot-Web-App/search?utf8=%E2%9C%93&q=todo).

[Raise an issue](https://github.com/FarmBot/Farmbot-Web-App/issues/new?title=Question%20about%20a%20TODO) if you have any questions.

If you raise an issue indicating that you haven't followed the setup instructions, looked through past issues, or done a cursory internet search for basic help, expect the issue to be closed and we'll point you to the setup instructions. *Again, if you do not have at least intermediate Linux and Ruby experience, please use the hosted version of the web app at my.farm.bot.* Running a self-hosted server is not easy!

