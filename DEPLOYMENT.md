
# Deployment

0. Create a fresh Ubuntu 16 server with Dokku (or just use DigitalOcean)
  * Make sure you have atleast 1gb.
0. [Install the latest version of Dokku (don't use that DigitalOcean image)](https://github.com/dokku/dokku#installing)
0. Visit the server's URL in a browser. Follow the directions on screen to setup Dokku.
0. `git remote add my_server dokku@your-server:my-api-name`
0. Install mariaDB plugin: [instructions](https://github.com/dokku/dokku-mariadb).
0. Create the Dokku app. `ssh dokku@your-server apps:create my-api-name`.
0. Give Dokku a place to store RSA keys: `ssh dokku@your-server storage:mount my-api-name /var/lib/dokku/data/keys:/keys`.
0. Create a databse: `ssh dokku@your-server mariadb:create my_db`
0. Link the DB: `ssh dokku@your-server mariadb:link my_db my-api-name`
0. Set ENV vars (Set `JS\_FILE\_URL` and `MQTT_HOST` to real values):
  * `ssh dokku@your-server config:set my-api-name DEVISE_SECRET=$(rake secret) JS_FILE_URL=//mycdn.org/farmbot-fronted.js MQTT_HOST=my-mqtt-server.org`
0. Deploy the app: `git push dokku@your-server:my-api-name master `
0. Migrate the database: `ssh dokku@your-server run my-api-name rake db:setup`
0. Your API is ready to go! You probably need to deploy the MQTT server next.

# Old / Legacy Setup

(Added Sept. 2016)

No longer used, but possibly relevant for those running legacy servers.

0. Create a fresh Ubuntu 14 server with Dokku (or just use DigitalOcean)
0. [Upgrade to the latest version of Dokku](https://github.com/dokku/dokku/blob/master/docs/upgrading.md) (especially if you are on DigitalOcean- their version is out of date)
0. Install dokku-haproxy plugin: `ssh root@YOUR_SERVER dokku plugin:install https://github.com/256dpi/dokku-haproxy.git`
0. Deploy: `git push dokku@YOUR_SERVER:mqtt`
0. Point to correct host/port: `ssh dokku@MQTT_SERVER config:set mqtt PORT=3002 DOKKU_NGINX_PORT=3002 WEB_APP_URL=WEBAPP_URL_HERE`
0. Expose MQTT port: `ssh dokku@MQTT_SERVER ports:add mqtt 1883 web 1883`
