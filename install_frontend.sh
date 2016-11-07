#!/bin/bash

CURRENT_DIR=$(pwd)
# Clone into a temp folder...
rm -rf /tmp/farmbot_frontend
mkdir /tmp/farmbot_frontend
git clone https://github.com/farmbot/farmbot-web-frontend.git /tmp/farmbot_frontend
cd /tmp/farmbot_frontend
npm install 2>&1
# Make webpack executable and compile everything.
chmod +x node_modules/webpack/bin/webpack.js
npm run build 2>&1
# rm -rf .git

cd $CURRENT_DIR
# Move it over to the rails /public directory and install deps
mkdir public/ -p
# mkdir public/app -p
# mkdir public/app-resources -p

cp -R /tmp/farmbot_frontend/public/* public/ 
