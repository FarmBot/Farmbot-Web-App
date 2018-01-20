# Notes About This File

Parts of this document may be out of date or reflect practices that are no longer relevant to the latest version of the Web App.

Please raise an issue if you hit any issues during deployment.

# Run on a Local Machine (saves time)

If you want to run a server on a LAN for personal use, this is the easiest and cheapest option.

**Simplicity:** :heart::heart::heart:

**Reliability:** :broken_heart:

**Affordability:** :heart::heart::heart:

 1. Follow the [developer setup guide](https://github.com/FarmBot/Farmbot-Web-App#developer-setup).

# Deployment to Dokku (saves money)

**Simplicity:** :broken_heart:

**Reliability:** :heart::heart:

**Affordability:** :heart::heart:

Although Dokku is a great way to set up a server for personal use, it is not the primary deployment method at FarmBot, Inc. As such, our ability to troubleshoot Dokku related issues is limited. We are currently updating the Dokku deployment instructions to reflect the latest server setup. It is a work in progress. See `dokku.sh` for instructions.

# Deployment Using Heroku (best reliability)

**Simplicity:** :heart::heart::heart::heart:

**Reliability:** :heart::heart::heart::heart:

**Affordability:** :broken_heart:

 1. Deploy as you would normally [deploy to Heroku](https://devcenter.heroku.com/articles/getting-started-with-rails4#deploy-your-application-to-heroku)
 2. Enable Dyno metadata: `heroku labs:enable runtime-dyno-metadata --app <app name>` (we need this to know the version number of the web app).

Don't forget to [set ENV vars](https://devcenter.heroku.com/articles/config-vars) and run `heroku run rake db:setup`.
