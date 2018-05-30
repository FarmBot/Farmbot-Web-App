# How to install FarmBot Web API on a Fresh Ubuntu 17 machine.

# Remove old (possibly broke) docker versions
sudo apt-get remove docker docker-engine docker.io

# Install docker
sudo apt-get install apt-transport-https ca-certificates curl software-properties-common rake --yes
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu xenial stable" --yes
sudo apt-get update --yes
sudo apt-get install docker-ce --yes
sudo docker run hello-world # Should run!

# Install RVM
command curl -sSL https://rvm.io/mpapis.asc | gpg --import -
curl -sSL https://get.rvm.io | bash
source /usr/local/rvm/scripts/rvm
rvm install "ruby-2.5.1"
cd .
rvm --default use 2.5.1
# LOG OUT AND LOG BACK IN NOW.

# Image Magick
sudo apt-get install imagemagick --yes


# Install Node
curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
sudo apt-get install -y nodejs --yes

# Install Yarn
curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
sudo apt-get update && sudo apt-get install yarn

# Install database deps
sudo apt-get install libpq-dev postgresql-contrib --yes

# Install FarmBot Web App
git clone https://github.com/FarmBot/Farmbot-Web-App --depth=10 --branch=master
cd Farmbot-Web-App
gem install bundler
npm install yarn
bundle install
yarn install
cp config/database.example.yml config/database.yml
cp config/application.example.yml config/application.yml

# == This is a very important step!!! ==
#
# Open `config/application.yml` in a text editor and change all the values.
#
# == Nothing will work if you skip this step!!! ==
# Don't know which editor to use?
# Use micro! `snap install micro --classic`
# READ THE FILE AND CHANGE THE VALUES ^
<<<<<<< HEAD
rake keys:generate
# Next, we will work on the datbase:
sudo -u postgres psql
# Type this into `psql` (should be open after typing command above):
#     CREATE USER "your_username_here" WITH SUPERUSER;
#     \q

# After typing \q you will be exited from `psql`. Continue database creation...
=======

# Next, we need to set some thing up in PostgreSQL
# Run this command...
  sudo -u postgres psql
#  Now that you are in the PSQL command prompt, enter these commands:
#
#    CREATE USER "your_system_username_here" WITH SUPERUSER;
#    \q
#
# ...after running `\q` we are back to the shell- Continue installation as
# usual.

# Generate a set of *.pem files for data encryption:
rake keys:generate
# Create the database for the app to use:
>>>>>>> b585dfe1a0cc349c39720bf482129b51eb65beb4
rake db:create:all db:migrate db:seed

# Run the database migration and unit tests (API only)
RAILS_ENV=test rake db:create db:migrate && rspec spec

# Run UI-level unit tests:
npm run test

# INSTALLATION IS NOW COMPLETE ===================================+
# You may run the commands below every time you start the server. |
# ================================================================+

<<<<<<< HEAD
# You may run the commands below every time you wish to start the server:
# The commands before this were only one-off commands for installation.
# Run the web server (new tab, SAME DIRECTORY)
# Don't worry about the "MQTT server is unreachable" messages yet-
#   we still need to start MQTT (next).
bundle exec rails api:start

# Run MQTT (new tab, SAME DIRECTORY)
bundle exec rails mqtt:start
=======
# Runs the web server in new tab, but use SAME DIRECTORY AS BEFORE. Don't worry
# about the "MQTT server is unreachable" messages yet- we still need to start
# MQTT (next).
rails api:start

# Run MQTT (new tab or window, SAME DIRECTORY)
rails mqtt:start
>>>>>>> b585dfe1a0cc349c39720bf482129b51eb65beb4

# RUNNING ON PORT 80 =======================================================+
# NEXT STEP IS OPTIONAL. DO THIS IF YOU WANT TO USE PORT 80 INSTEAD OF 3000.|
# This is a quick alternative to running rails as root / sudo.              |
# ==========================================================================+

# Step 1: Install `socat`
sudo apt-get install socat

# Step 2: Forward port 80 to port 3000
sudo socat TCP-LISTEN:80,fork TCP:localhost:3000

# Other options for routing traffic to port 80 include:
#  * Using `iptables`
#  * Configuring NGinx as a reverse proxy.
<<<<<<< HEAD
# The options above are intended for advanced users.
# Our ability to provide support to individual users for these use cases is
# limited
=======
# The options above are intended for advanced users. Our ability to provide
# support to individual users for these use cases is limited.
>>>>>>> b585dfe1a0cc349c39720bf482129b51eb65beb4
