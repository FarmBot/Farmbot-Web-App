
# Deployment

0. Create a fresh Ubuntu 16 server with Dokku (or just use DigitalOcean)
  * Make sure you have atleast 1gb.
0. [Install the latest version of Dokku (don't use that DigitalOcean image)](https://github.com/dokku/dokku#installing)
0. Setup Dokku by visiting the server's URL. Follow the directions on screen.
0. `git remote add my_server dokku@138.68.19.190:my-api-name`
0. Install mariaDB plugin: [instructions](https://github.com/dokku/dokku-mariadb).
0. Create a databse: `ssh dokku@your-server mariadb:create my_db`
0. Link the DB: `ssh dokku@your-server mariadb:link my_db my-api-name`
0. Set ENV vars:
  * `ssh dokku@staging-next config:set my-api-name DEVISE_SECRET=$(rake secret)`
  * `ssh dokku@staging-next config:set my-api-name JS_FILE_URL=//mycdn.org/farmbot-fronted.js`
  * `ssh dokku@staging-next config:set my-api-name MQTT_HOST=my-mqtt-server.org`
  * `ssh dokku@staging-next config:set my-api-name DATABASE_URL=mysql://dbusername:dbpassword@dburl:dbport/dbname`

# Old / Legacy Setup

(Added Sept. 2016)

0. Create a fresh Ubuntu 14 server with Dokku (or just use DigitalOcean)
0. [Upgrade to the latest version of Dokku](https://github.com/dokku/dokku/blob/master/docs/upgrading.md) (especially if you are on DigitalOcean- their version is out of date)
0. Install dokku-haproxy plugin: `ssh root@YOUR_SERVER dokku plugin:install https://github.com/256dpi/dokku-haproxy.git`
0. Deploy: `git push dokku@YOUR_SERVER:mqtt`
0. Point to correct host/port: `ssh dokku@MQTT_SERVER config:set mqtt PORT=3002 DOKKU_NGINX_PORT=3002 WEB_APP_URL=WEBAPP_URL_HERE`
0. Expose MQTT port: `ssh dokku@MQTT_SERVER ports:add mqtt 1883 web 1883`
