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

# Setting up SSL

Before setting up SSL, [setup your domain on Heroku](https://devcenter.heroku.com/articles/custom-domains).

Install [Certbot](https://certbot.eff.org/).

Run `sudo certbot certonly --manual`

Wait until you see this message and **DO NOT CONTINUE**:

```
Make sure your web server displays the following content at
http://YOUR_DOMAIN/.well-known/acme-challenge/SOME-LONG-URL before continuing:

ya6k1edW38z-CopyThisValueNow!!!

```

Set the `ACME_SECRET` ENV var to the value shown above (yours will be different) and **restart your API process**. On heroku, do `heroku ps:restart --app=MY-APP-NAME-HERE`

Once you have restarted the API process, continue through the installer.

You should see this:

```
IMPORTANT NOTES:
 - Congratulations! Your certificate and chain have been saved at
   /etc/letsencrypt/live/YOUR_DOMAIN/fullchain.pem
```

**Heroku Users**: Run the following snippet to submit the certs to Heroku:

**First time:**

```
heroku certs:add /etc/letsencrypt/live/YOUR_DOMAIN/fullchain.pem /etc/letsencrypt/live/YOUR_DOMAIN/privkey.pem
```

**After that:**

```
sudo heroku certs:update /etc/letsencrypt/live/YOUR_DOMAIN/fullchain.pem /etc/letsencrypt/live/YOUR_DOMAIN/privkey.pem --app=HEROKU_APP_NAME
```
Heroku will then give you instructions on which DNS records you must create.

# Renew SSL Certificates

 1. Run `sudo certbot certonly --manual -d YOUR_DOMAIN_HERE`
 2. Wait for this message:

```

Make sure your web server displays the following content at
http://YOUR_DOMAIN/.well-known/acme-challenge/<CODE_HERE> before continuing:

3tFAi5c7tJK-YOURS\_WILL\_BE\_DIFFERENT

```
 3. Set the `ACME_SECRET` ENV var to the value shown above (yours will be different). Process restart may be required if you are not on Heroku!

```
heroku config:set ACME_SECRET=THAT_BIG_CODE_FROM_PREVIOUS_STEP --app=YOUR_APP_HERE
```

```
  - Congratulations! Your certificate and chain have been saved at
   /etc/letsencrypt/live/YOUR_DOMAIN/fullchain.pem.
```

 4. (Heroku users only) `sudo heroku certs:update /etc/letsencrypt/live/YOUR_DOMAIN_HERE/fullchain.pem /etc/letsencrypt/live/YOUR_DOMAIN_HERE/privkey.pem`
