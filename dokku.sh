# Start on an empty, clean Ubuntu 17 box.

# RUN UPDATES
apt-get update
apt-get upgrade --yes

# INSTALL DOKKU
wget https://raw.githubusercontent.com/dokku/dokku/v0.10.5/bootstrap.sh;
sudo DOKKU_TAG=v0.10.5 bash bootstrap.sh

# ADD SSH KEYS to the server because passwords are bad.
# Run this locally:
#   cat ~/.ssh/id_rsa.pub | ssh user@host "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"
#   xclip -sel clip < ~/.ssh/id_rsa.pub
# Visit your machine in Chrome. Copy/paste clipboard contents into the box

dokku apps:create farmbot
dokku plugin:install https://github.com/dokku/dokku-postgres.git
dokku postgres:create farmbot_database
dokku postgres:link farmbot_database farmbot

# On your local machine:
#   git remote add dokku dokku@___YOUR_HOST_HERE___:farmbot

# Set ENV vars
# TODO: Deal with public_key stuff, volumes, etc.
dokku config:set farmbot MQTT_HOST="192.168.x.x" API_HOST="192.168.x.x" NO_EMAILS="TRUE"

# Farmbot needs a place to store encryption keys.
dokku storage:mount farmbot /var/lib/dokku/data/keys:/keys

# Bootstrap the database:
dokku run my_app_name rake db:setup

# ONLY IF YOU DO NOT HAVE A DOMAIN NAME (testing)
dokku proxy:ports-add farmbot http:80:5000

# You're ready to deploy! On your local machine:
#   git push dokku master
# Some deployments have been known to fail unexpectedly on first build (new VMs)
# In those cases, you can often run `git push dokku master` to force a re-build.

# IF YOU NEED TO DEBUG PROBLEMS: redeploy after performing the following:
dokku trace on                                     # sets dokku to debug mode
dokku config:set --global CURL_TIMEOUT=600         # Prevent timeouts
dokku config:set --global CURL_CONNECT_TIMEOUT=30  # Same thing

# TODO: Setup RabbitMQ
