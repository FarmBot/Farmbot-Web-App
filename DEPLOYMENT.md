# Notes About This File

Parts of this document may be out of date or reflect practices that are no longer relevant to the latest version of the Web App.

Please raise an issue if you hit any issues during deployment.

# Run on a Local Machine

If you want to run a server on a LAN for personal use, this is the easiest and cheapest option.

**Simplicity:** :heart: :heart: :heart:

**Reliability:** :broken_heart:

**Affordability:** :heart: :heart: :heart:

 1. Follow the [developer setup guide](https://github.com/FarmBot/Farmbot-Web-App#self-hosting).

# Deployment Using Heroku (best reliability)

**Simplicity:** :heart: :heart: :heart: :heart:

**Reliability:** :heart: :heart: :heart: :heart:

**Affordability:** :broken_heart:

 1. Deploy as you would normally [deploy to Heroku](https://devcenter.heroku.com/articles/getting-started-with-rails6#deploy-the-app-to-heroku) (buildpacks: _heroku/nodejs_, _heroku/ruby_)
 2. Enable Dyno metadata: `heroku labs:enable runtime-dyno-metadata --app <app name>` (we need this to know the version number of the web app).
 3. (If emails are enabled) Enable the [Heroku scheduler](https://elements.heroku.com/addons/scheduler) and configure it to run `rake api:log_digest` every 10 minutes. This is required for Device log digests via email.

Don't forget to [set ENV vars](https://devcenter.heroku.com/articles/config-vars) and run `heroku run rake db:setup`.
