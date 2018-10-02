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

# Install FarmBot Web App
git clone https://github.com/FarmBot/Farmbot-Web-App --depth=10 --branch=master
cd Farmbot-Web-App

# == This is a very important step!!! ==
#
# Open `config/application.yml` in a text editor and change all the values.
#
# == Nothing will work if you skip this step!!! ==
#
# READ `example.env` AND CHANGE THE VALUES. SAVE RESULTS TO `.env`!
# This is the most important step ^

snap install micro --classic # Don't like `micro`? vim, nano, etc are fine, too.
# READ NOTE ABOVE. Very important!
# SAVE THIS FILE AS `.env` WHEN FINISHED!
nano example.env
# Build the docker image
sudo docker-compose build
# Install application specific Ruby dependencies
sudo docker-compose run web bundle install
# Install application specific Javascript deps
sudo docker-compose run web npm install
# Create a database in PostgreSQL
sudo docker-compose run web bundle exec rails db:setup
# Manually create the rabbitmq.conf file
# TODO: Improve this step -RC 1 Oct 18
sudo docker-compose run web bundle exec rails r mqtt/server.rb
# Generate a set of *.pem files for data encryption
sudo docker-compose run web rake keys:generate

# At this point, setup is complete.
# You can verify installation by running unit tests.
# The steps below are _OPTIONAL_

# Create the database for the app to use:
sudo docker-compose run -e RAILS_ENV=test web bundle exec rails db:setup
# Run the tests in the "test" RAILS_ENV:
sudo docker-compose run -e RAILS_ENV=test web rspec spec
# Run user-interface unit tests:
sudo docker-compose run web npm run test
