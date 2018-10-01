# How to install FarmBot Web API on a Fresh Ubuntu 18.04.1 LTS Machine

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

# # Install Yarn
# curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
# echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
# sudo apt-get update && sudo apt-get install yarn

# Install FarmBot Web App
git clone https://github.com/FarmBot/Farmbot-Web-App --depth=10 --branch=master
cd Farmbot-Web-App

# == This is a very important step!!! ==
#
# Open `config/application.yml` in a text editor and change all the values.
#
# == Nothing will work if you skip this step!!! ==
# Don't know which text editor to use?
# Use micro! `snap install micro --classic`
#
# BE SURE TO READ `application.yml` AND CHANGE THE VALUES

sudo docker-compose build
bundle install
yarn install
cp config/database.example.yml config/database.yml
cp config/application.example.yml config/application.yml


# Next, we need to set some things up in PostgreSQL
# Before proceeding, it is important to know your username on the machine.
# Type the following command to determine your system username:
whoami

# ...then Run this command...
sudo -u postgres psql

#  Now that you are in the PSQL command prompt,
#  enter the commands below. Replace your_system_username_here with the results
#  of the `whoami` command:
#
#    CREATE USER "your_system_username_here" WITH SUPERUSER;
#    \q
#
# ...after running `\q` we are back to the shell- Continue installation as
# usual.

# Generate a set of *.pem files for data encryption:
rake keys:generate

# Create the database for the app to use:
rake db:create:all db:migrate db:seed

# Run the database migration and unit tests (API only)
RAILS_ENV=test rake db:create db:migrate && rspec spec

# Run UI-level unit tests:
npm run test

# RUNNING ON PORT 80 =======================================================+
# NEXT STEP IS OPTIONAL. DO THIS IF YOU WANT TO USE PORT 80 INSTEAD OF 3000.|
# This is a quick alternative to running rails as root / sudo.              |
# ==========================================================================+
