# Run on a Local Machine (fast)

If you want to run a server on a LAN for personal use, this is the easiest and cheapest option.

**Simplicity:** :heart::heart::heart:
**Reliability:** :broken_heart:
**Affordability:** :heart::heart::heart:

 1. Follow the [developer setup guide](https://github.com/FarmBot/Farmbot-Web-API#developer-setup).
 2. Run `rails s -e production -b 0.0.0.0` (Set ENV vars accordingly).

# Deployment to Dokku (cheap)

**NOTE TO USERS**: We no longer deploy the server using Dokku. Although we will make a best effort to support Dokku users, our ability to provide troubleshooting and documentation for Dokku setups is limited since we do not use it ourselves.

**Simplicity:** :broken_heart:
**Reliability:** :heart::heart:
**Affordability:** :heart::heart:

0. Provision a fresh Ubuntu 16 server (we use DigitalOcean's "Ubuntu 16 docker" image).
  * Make sure you have atleast 1gb.
0. [Install the latest version of Dokku (don't use that DigitalOcean image)](https://github.com/dokku/dokku#installing)
0. Visit the server's URL in a browser. Follow the directions on screen to setup Dokku.
0. `git remote add my_server dokku@my_server_name:my_app_name`
0. Install mariaDB plugin: [instructions](https://github.com/dokku/dokku-mariadb).
0. Create the Dokku app (if you didn't do it already). `ssh dokku@my_server_name apps:create my_app_name`.
0. Give Dokku a place to store RSA keys: `ssh dokku@my_server_name storage:mount my_app_name /var/lib/dokku/data/keys:/keys`.
0. Create a databse: `ssh dokku@my_server_name mariadb:create my_db_name`
0. Link the DB: `ssh dokku@my_server_name mariadb:link my_db_name my_app_name`
0. Set ENV vars to real values (full ENV var list is in README:
  * `ssh dokku@my_server_name config:set my_app_name DEVISE_SECRET=$(rake secret) API_HOST=yourdomain.com API_PORT=1234`
0. Deploy the app: `git push dokku@my_server_name:my_app_name master `
0. (optional) If that didn't work, do this on the server and try pushing again:
    * `dokku trace on` (sets dokku to debug mode).
    * `dokku config:set --global CURL_TIMEOUT=600`
    * `dokku config:set --global CURL_CONNECT_TIMEOUT=30`
0. Migrate the database: `ssh dokku@my_server_name run my_app_name rake db:setup`
0. Your API is ready to go! You probably need to deploy the MQTT server next.

# Deployment Using Heroku (good)

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
http://yourdomain.io/.well-known/acme-challenge/SOME-LONG-URL before continuing:

ya6k1edW38z-CopyThisValueNow!!!

```

Set the `ACME_SECRET` ENV var to the value shown above (yours will be different) and **restart your API process**.

Once you have restarted the API process, continue through the installer.

You should see this:

```
IMPORTANT NOTES:
 - Congratulations! Your certificate and chain have been saved at
   /etc/letsencrypt/live/yourdomain.io/fullchain.pem
```

**Heroku Users**: Run the following snippet to submit the certs to Heroku:

```
heroku certs:add /etc/letsencrypt/live/yourdomain.io/fullchain.pem /etc/letsencrypt/live/yourdomain.io/privkey.pem
```

Heroku will then give you instructions on which DNS records you must create.

**Dokku Users**: FarmBot, Inc. no longer uses Dokku. As such, our ability to troubleshoot problems is limited.
Please [raise an issue](https://github.com/FarmBot/Farmbot-Web-API/issues/new) to receive community support.

# Renew SSL Certificates

 1. Run `sudo certbot certonly --manual -d YOUR_DOMAIN_HERE`
 2. Wait for this message:

```

Make sure your web server displays the following content at
http://staging.farmbot.io/.well-known/acme-challenge/3tFAi5c7tJK-UJu0LGFM0xFwSExRZqzZD60w1723wOo before continuing:

3tFAi5c7tJK-YOURS\_WILL\_BE\_DIFFERENT

```
 3. Set the `ACME_SECRET` ENV var to the value shown above (yours will be different). Process restart may be required if you are not on Heroku!

```
  - Congratulations! Your certificate and chain have been saved at
   /etc/letsencrypt/live/staging.farmbot.io/fullchain.pem.
```

 4. (Heroku users only) `sudo heroku certs:update /etc/letsencrypt/live/YOUR_DOMAIN_HERE/fullchain.pem /etc/letsencrypt/live/YOUR_DOMAIN_HERE/privkey.pem`


# FILE / PHOTO storage

 This is a work in progress. **Please ignore this section**

 * We use paperclip and the fog gem for Google Cloud Storage uploads.
 * You need to use an *INTEROPERABILITY KEY* to setup Paperclip/fog. You will be frustrated if you try to generate an API key.
 * INTEROPERABILITY keys can be found under the "settings" pane of the bucket in the INTEROPERABILITY tab.
