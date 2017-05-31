# Run on a Local Machine (fast)

If you want to run a server on a LAN for personal use, this is the easiest and cheapest option.

**Simplicity:** :heart::heart::heart:
**Reliability:** :broken_heart:
**Affordability:** :heart::heart::heart:

 1. Follow the [developer setup guide](https://github.com/FarmBot/Farmbot-Web-API#developer-setup).

# Deployment to Dokku (cheap)

**DEPRECATION NOTICE / PULL REQUESTS WELCOME**: We no longer deploy the server using Dokku. The instructions related to MariaDB are out of date (we use Postgresql now). **If you wish to use Dokku** we would be happy to help you along the way. Please raise an issue if you would like to help with updating the deployment docs.

**Simplicity:** :broken_heart:
**Reliability:** :heart::heart:
**Affordability:** :heart::heart:

0. Provision a fresh Ubuntu 16 server. We recommend DigitalOcean's "Ubuntu 16 docker" image. Make sure you have at least 1gb of memory. **Don't use the Dokku image that Digital Ocean provides**. It is out of date and will not support this application.
1. [Install the latest version of Dokku onto the machine](https://github.com/dokku/dokku#installing)
2. Visit the server's URL in a browser. Follow the directions on screen to setup Dokku.
3. `git remote add my_server dokku@my_server_name:my_app_name`
4. Install mariaDB plugin: [instructions](https://github.com/dokku/dokku-postgres).
5. Create the Dokku app (if you didn't do it already). `ssh dokku@my_server_name apps:create my_app_name`.
6. Give Dokku a place to store RSA keys: `ssh dokku@my_server_name storage:mount my_app_name /var/lib/dokku/data/keys:/keys`.

(Out of date. Help welcome)~~7. Create a databse: `ssh dokku@my_server_name mariadb:create my_db_name`~~

(Out of date. Help welcome)~~8. Link the DB: `ssh dokku@my_server_name mariadb:link my_db_name my_app_name`~~

9. Set ENV vars to real values (See full instructions in the README)

10. `ssh dokku@my_server_name config:set my_app_name DEVISE_SECRET=$(rake secret) API_HOST=yourdomain.com API_PORT=1234`
11. Deploy the app: `git push dokku@my_server_name:my_app_name master `
12. (optional) In case of failure, redeploy after performing the following:
  * `dokku trace on` (sets dokku to debug mode).
  * `dokku config:set --global CURL_TIMEOUT=600`
  * `dokku config:set --global CURL_CONNECT_TIMEOUT=30`
16. Migrate the database: `ssh dokku@my_server_name run my_app_name rake db:setup`
17. Your API is ready to go! You probably need to deploy the MQTT server next.

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
http://staging.farmbot.io/.well-known/acme-challenge/<CODE_HERE> before continuing:

3tFAi5c7tJK-YOURS\_WILL\_BE\_DIFFERENT

```
 3. Set the `ACME_SECRET` ENV var to the value shown above (yours will be different). Process restart may be required if you are not on Heroku!

```
heroku config:set ACME_SECRET=THAT_BIG_CODE_FROM_PREVIOUS_STEP --app=YOUR_APP_HERE
```

```
  - Congratulations! Your certificate and chain have been saved at
   /etc/letsencrypt/live/staging.farmbot.io/fullchain.pem.
```

 4. (Heroku users only) `sudo heroku certs:update /etc/letsencrypt/live/YOUR_DOMAIN_HERE/fullchain.pem /etc/letsencrypt/live/YOUR_DOMAIN_HERE/privkey.pem`
