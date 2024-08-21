# FarmBot Web App

[![codebeat badge](https://codebeat.co/badges/7f81859b-67fe-4bdb-b56f-050bfed35e9c)](https://codebeat.co/projects/github-com-farmbot-farmbot-web-app-staging)
[![codecov](https://codecov.io/gh/FarmBot/Farmbot-Web-App/branch/staging/graph/badge.svg)](https://codecov.io/gh/FarmBot/Farmbot-Web-App)
[![Coverage Status](https://coveralls.io/repos/github/FarmBot/Farmbot-Web-App/badge.svg)](https://coveralls.io/github/FarmBot/Farmbot-Web-App)
[![Maintainability](https://api.codeclimate.com/v1/badges/74091163d8a02bb8988f/maintainability)](https://codeclimate.com/github/FarmBot/Farmbot-Web-App/maintainability)

This codebase contains FarmBot's web based user interface, a RESTful JSON API, and a Dockerized MQTT server. The API stores data such as user account information, farm designs, sequences, authorization tokens, and a variety of other resources. The MQTT server facilitates realtime messaging from the browser to the device.

## I own a FarmBot, do I need this?

**No. If you are an owner of a FarmBot kit, you do not need to download or self-host this software.** [FarmBot Inc](https://farm.bot) provides a free-to-use instance of the web app at [my.farm.bot](https://my.farm.bot/) which we recommend to all FarmBot owners. Get started with [these instructions](https://software.farm.bot/docs/getting-started).

# Self hosting

Hosting your own server requires an understanding of how Ruby on Rails applications (and databases) operate. Self-hosting the web app will not provide you with a more stable user experience and may result in accidental security issues or data loss. There are only a handful of use cases where running a third party server may be necessary:

 * Development of new features, bug fixes, and pull requests.
 * Independent security research and auditing.

:warning: If you are not a Ruby on Rails developer or you have never written a Ruby on Rails application, please use [my.farm.bot](https://my.farm.bot/) instead of trying to self host. *Running a server is a non-trivial task that may require hundreds of hours of setup and maintenance time.* Data loss and security issues are possible in some circumstances. Self hosting requires an intermediate background (3 to 5 years experience) in Ruby, SQL and Linux system administration.

:no_entry: **Technical support for self hosting is beyond the scope of the basic technical support that FarmBot Inc provides with each FarmBot kit. If you or your organization pursue self hosting, you will need to operate your server independently of FarmBot Inc technical support. We do not have the resources available to help novice developers learn to setup servers, environments, configurations, or perform basic Linux command line instructions.**

## Local setup

We recommend all self hosted installations be installed on a fresh Ubuntu server using the instructions provided in [local_setup_instructions.sh](local_setup_instructions.sh). These instructions are regularly checked and updated to ensure they work. **At this time we cannot provide assistance for running the web app in different environments.**

If you raise an issue indicating that you haven't followed the setup instructions, looked through past issues, or done a cursory internet search for basic help, expect the issue to be closed and we'll point you to the setup instructions. *Again, if you do not have at least intermediate Linux and Ruby experience, please use [my.farm.bot](https://my.farm.bot).* Running a self-hosted server is not easy!

## Configuration settings (important)

**Your server won't run without setting ENV variables first**. Set the ENV variables directly from your shell / server management tool or by writing a `.env` file in the server's base directory. See [example.env](example.env) for a list of all the variables that must be set.

Encryption keys will be auto-generated if not present. They can be reset using `rake keys:generate`. If `ENV['RSA_KEY']` is set, it will be used in place of the `*.pem` files. This is useful for environments like Heroku and Docker, where file system access is not allowed.

## Updates

We update `main` roughly every 2 to 4 weeks. If you self host the application you will need to manually update the software to get the latest updates. Technical support for self hosting is beyond the scope of the basic technical support that we provide with each FarmBot kit.

## Example API requests

See our documentation for a list of [example API requests and responses](https://developer.farm.bot/docs/api-docs). If you wish to write an add-on application that uses the FarmBot API, please let us know in an issue. We are happy to answer any specific questions you may have.

# Contributing

There are many ways in which you can contribute to the FarmBot web app:

:pencil: Browse the [open issues](https://github.com/FarmBot/Farmbot-Web-App/issues) and make thoughtful suggestions or just let us know if something is particularly important to you.

:books: Check out our [developer documentation](https://developer.farm.bot/) for writing add-ons and plugins for FarmBot.

:mag: Search the repository for [TODOs](https://github.com/FarmBot/Farmbot-Web-App/search?utf8=%E2%9C%93&q=todo). Sometimes these are simple tasks suitable for new contributors.

:globe_with_meridians: Help [translate the web app](#translating-the-web-app) into your language! There are FarmBot owners in over 90 countries who speak a wide range of primary languages.

:lock: [Responsibly disclose a security vulnerability](http://disclosure.farm.bot/). We take security seriously and value the input of independent researchers.

:bulb: [Open an issue](https://github.com/FarmBot/Farmbot-Web-App/issues/new) to report a non-security related problem or propose a new feature or improvement idea.

## Translating the web app

Thanks for your interest in internationalizing the FarmBot web app! To add translations:

1. Fork this repo
0. Navigate to `/public/app-resources/languages` and run the command `node _helper.js yy` where `yy` is your language's [language code](http://www.science.co.il/Language/Locale-codes.php). Eg: `ru` for Russian.
0. Edit the translations in the file created in the previous step: `"phrase": "translated phrase"`.
0. When you have updated or added new translations, commit/push your changes and submit a pull request.
