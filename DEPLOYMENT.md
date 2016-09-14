
# Deployment

0. Provision a fresh Ubuntu 16 server (we use DigitalOcean's "Ubuntu 16 x64" image).
  * Make sure you have atleast 1gb.
0. [Install the latest version of Dokku (don't use that DigitalOcean image)](https://github.com/dokku/dokku#installing)
0. Visit the server's URL in a browser. Follow the directions on screen to setup Dokku.
0. `git remote add my_server dokku@my_server_name:my_app_name`
0. Install mariaDB plugin: [instructions](https://github.com/dokku/dokku-mariadb).
0. Create the Dokku app (if you didn't do it already). `ssh dokku@my_server_name apps:create my_app_name`.
0. Give Dokku a place to store RSA keys: `ssh dokku@my_server_name storage:mount my_app_name /var/lib/dokku/data/keys:/keys`.
0. Create a databse: `ssh dokku@my_server_name mariadb:create my_db_name`
0. Link the DB: `ssh dokku@my_server_name mariadb:link my_db_name my_app_name`
0. Set ENV vars (Set `JS\_FILE\_URL` and `MQTT_HOST` to real values):
  * `ssh dokku@my_server_name config:set my_app_name DEVISE_SECRET=$(rake secret) JS_FILE_URL=//mycdn.org/farmbot-fronted.js MQTT_HOST=my-mqtt-server.org API_HOST=yourdomain.com API_PORT=1234`
0. Deploy the app: `git push dokku@my_server_name:my_app_name master `
0. (optional) If that didn't work, do this on the server and try pushing again:
    * `dokku trace on` (sets dokku to debug mode).
    * `dokku config:set --global CURL_TIMEOUT=600`
    * `dokku config:set --global CURL_CONNECT_TIMEOUT=30`
0. Migrate the database: `ssh dokku@my_server_name run my_app_name rake db:setup`
0. Your API is ready to go! You probably need to deploy the MQTT server next.
