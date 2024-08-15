# How to install FarmBot Web API on a fresh Ubuntu 24.04 machine

# IMPORTANT NOTE: Resources are limited and FarmBot Inc cannot provide
# longterm support to self-hosted users. If you have never administered a
# Ruby on Rails application, we highly advise stopping now. This presents an
# extremely high risk of data loss. Free hosting is provided at
# https://my.farm.bot and eliminates the risks and troubles of self-hosting.
#
# You are highly encouraged to use the my.farm.bot servers. Self-hosted
# documentation is provided with the assumption that you have experience with
# Ruby/Javascript development.
#
# Self-hosting a FarmBot server is not a simple task.

# Install docker and docker compose
sudo apt update
sudo apt install ca-certificates curl gnupg -y
source /etc/os-release
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/$ID/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/$ID $VERSION_CODENAME stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin -y
# Verify installation
sudo docker run hello-world
sudo docker compose version

# Install FarmBot Web App
# ⚠ SKIP THIS STEP IF UPGRADING!
git clone https://github.com/FarmBot/Farmbot-Web-App --depth=5 --branch=main

cd Farmbot-Web-App

cp example.env .env # ⚠ SKIP THIS STEP IF UPGRADING!

# == This is a very important step!!! ==
#
# Open `.env` in a text editor and change all the values.
#
# == Nothing will work if you skip this step!!! ==

nano .env          # ⚠ SKIP THIS STEP IF UPGRADING!
# ^ This is the most important step
# READ NOTE ABOVE. Very important!

# Install the correct version of bundler for the project
sudo docker compose run web gem install bundler
# Install application specific Ruby dependencies
sudo docker compose run web bundle install
# Install application specific Javascript deps
sudo docker compose run web npm install
# Create a database in PostgreSQL
sudo docker compose run web bundle exec rails db:create db:migrate
# Generate a set of *.pem files for data encryption
sudo docker compose run web rake keys:generate # ⚠ SKIP THIS STEP IF UPGRADING!
# Run the server! ٩(^‿^)۶
# Note: You won't be able to log in until you see a message similar to this:
#   "✨  Built in 44.92s"
# You will just get an empty screen otherwise.
# This only happens during initialization and may take a long time on slow machines.
sudo docker compose up

# At this point, setup is complete.
# Content should be visible at http://YOUR_HOST:3000/.

# --- You can optionally verify installation by running unit tests. ---
  # Create the database for the app to use
  sudo docker compose run -e RAILS_ENV=test web bundle exec rails db:setup
  # Run the tests in the "test" RAILS_ENV
  sudo docker compose run -e RAILS_ENV=test web rspec spec
  # Run user-interface unit tests (requires a large amount of RAM)
  sudo docker compose run web npm run test
# --- end of optional tests ---

# === BEGIN OPTIONAL UPGRADES to later versions of the FarmBot Web App ===
  # Shut down the server
  sudo docker compose down
  # Start the database service by starting the web container
  sudo docker compose run web gem install bundler
  # Verify that the correct database service is running.
  # If the version doesn't print, a `git reset` may be required.
  sudo docker compose exec db pg_dumpall -V
  # Create a database backup (this will overwrite dump.sql!)
  # If you do not do this before `git pull`, you will need to `git reset` first.
  sudo docker compose exec db pg_dumpall -U postgres > dump.sql
  # Create a backup of the dump.sql file
  cp -vi dump.sql dump_$(date +%Y%m%d%H%M%S).sql
  # Stop and remove containers
  sudo docker stop $(sudo docker ps -a -q)
  sudo docker rm $(sudo docker ps -a -q)
  # Remove docker images. This will later require re-download of large amounts of data.
  sudo docker system prune -af --volumes
  # Delete the database. This will delete all of your data!
  # Only run after verifying your data is backed up in dump.sql.
  # Commented with `#` for safety. Run the command without `#`.
  # sudo rm -rf docker_volumes/db
  # Verify that the database has been deleted. Do not continue on until "OK".
  if [ -d docker_volumes/db ]; then echo "ERROR"; else echo "OK"; fi
  # Download the latest version of the web app
  git pull https://github.com/FarmBot/Farmbot-Web-App.git main
  # Install Ruby gems
  sudo docker compose run web gem install bundler
  sudo docker compose run web bundle install
  # Install NPM packages
  sudo docker compose run web npm install
  # Replace the dump.sql password value with the value of POSTGRES_PASSWORD from .env
  nano dump.sql
  # Verify that the correct database service is running
  sudo docker compose exec db pg_dumpall -V
  # Restore the database
  sudo docker compose run -v $(pwd):/farmbot db bash
  # Run these commands in the db container shell opened by the previous command
  # --- begin db container shell commands ---
  cd /farmbot
  PGPASSWORD=$POSTGRES_PASSWORD psql -U postgres -h db < dump.sql
  exit
  # --- end db container shell commands ---
  # Migrate the database
  sudo docker compose run web rails db:migrate
  # Run the server
  sudo docker compose up
  # If you get a MQTT authentification error, stop and start the server again.
# === END OPTIONAL UPGRADES ===

