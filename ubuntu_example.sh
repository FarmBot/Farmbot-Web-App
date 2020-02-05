# How to install FarmBot Web API on a Fresh Ubuntu 18.10 Machine

# IMPORTANT NOTE: Resources are limited and Farmbot, inc. cannot provide
# longterm support to self-hosted users. If you have never administered a
# Ruby on Rails application, we highly advise stopping now. this presents an
# extremely high risk of data loss. Free hosting is provided at
# https://my.farm.bot and eliminates the risks and troubles of self-hosting.
#
# You are highly encouraged to use the my.farm.bot servers. Self hosted
# documentation is provided with the assumption that you have experience with
# Ruby/Javascript development.
#
# Self-hosting a Farmbot server is not a simple task.

# Remove old (possibly broke) docker versions
sudo apt-get remove docker docker-engine docker.io

# Install docker
sudo apt-get install apt-transport-https ca-certificates curl software-properties-common --yes
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu xenial stable" --yes
sudo apt-get update --yes
sudo apt-get install docker-ce --yes
sudo docker run hello-world # Should run!
# Install docker-compose
sudo curl -L "https://github.com/docker/compose/releases/download/1.22.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install FarmBot Web App
# ⚠ SKIP THIS STEP IF UPGRADING!
git clone https://github.com/FarmBot/Farmbot-Web-App --depth=5 --branch=master

cd Farmbot-Web-App

snap install micro --classic # Don't like `micro`? vim, nano, etc are fine, too.
cp example.env .env # ⚠ SKIP THIS STEP IF UPGRADING!

# == This is a very important step!!! ==
#
# Open `.env` in a text editor and change all the values.
#
# == Nothing will work if you skip this step!!! ==

micro .env          # ⚠ SKIP THIS STEP IF UPGRADING!
# ^ This is the most important step
# READ NOTE ABOVE. Very important!

# Install the correct version of bundler for the project
sudo docker-compose run web gem install bundler:2.1.4
# Install application specific Ruby dependencies
sudo docker-compose run web bundle install
# Install application specific Javascript deps
sudo docker-compose run web npm install
# Create a database in PostgreSQL
sudo docker-compose run web bundle exec rails db:create db:migrate
# Generate a set of *.pem files for data encryption
sudo docker-compose run web rake keys:generate # ⚠ SKIP THIS STEP IF UPGRADING!
# Build the UI assets via ParcelJS
sudo docker-compose run web rake assets:precompile
# Run the server! ٩(^‿^)۶
# NOTE: DONT TRY TO LOGIN until you see a message similar to this:
#   "✨  Built in 44.92s"
# THIS MAY TAKE A VERY LONG TIME ON SLOW MACHINES (~3 minutes on DigitalOcean)
# You will just get an empty screen otherwise.
# This only happens during initialization
sudo docker-compose up

# At this point, setup is complete. Content should be visible at ===============
#  http://YOUR_HOST:3000/.

# You can optionally verify installation by running unit tests.

# Create the database for the app to use:
sudo docker-compose run -e RAILS_ENV=test web bundle exec rails db:setup
# Run the tests in the "test" RAILS_ENV:
sudo docker-compose run -e RAILS_ENV=test web rspec spec
# Run user-interface unit tests REQUIRES AT LEAST 4 GB OF RAM:
sudo docker-compose run web npm run test

# === BEGIN OPTIONAL UPGRADES
  # To update to later versions of FarmBot,
  # shut down the server, create a database backup
  # and run commands below.
  git pull https://github.com/FarmBot/Farmbot-Web-App.git master
  sudo docker-compose build
  sudo docker-compose run web bundle install   # <== ⚠ UPGRADE USERS ONLY
  sudo docker-compose run web npm install      # <== ⚠ UPGRADE USERS ONLY
  sudo docker-compose run web rails db:migrate # <== ⚠ UPGRADE USERS ONLY
# === END OPTIONAL UPGRADES ^

