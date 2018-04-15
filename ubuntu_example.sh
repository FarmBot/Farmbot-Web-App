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

# == This is a very important step!!! ==
#
# Open `config/application.yml` in a text editor and change all the values.
#
# == Nothing will work if you skip this step!!! ==
# Don't know which editor to use?
# Use micro! `snap install micro --classic`
cp config/application.example.yml config/application.yml
# READ THE FILE AND CHANGE THE VALUES ^
sudo -u postgres psql
rake keys:generate
# Run this:
#     CREATE USER "your_username_here" WITH SUPERUSER;
#     \q
rake db:create:all db:migrate db:seed
RAILS_ENV=test rake db:create db:migrate && rspec spec
npm run test

# INSTALLATION IS NOW COMPLETE =================================================


# You may run the commands below every time you wish to start the server:
# The commands before this were only one-off commands for installation.
# Run the web server (new tab, SAME DIRECTORY)
# Don't worry about the "MQTT server is unreachable" messages yet-
#   we still need to start MQTT (next).
rails api:start

# Run MQTT (new tab, SAME DIRECTORY)
rails mqtt:start
