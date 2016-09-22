#!/bin/bash
rm -rf /tmp/farmbot_frontend
mkdir /tmp/farmbot_frontend
git clone https://github.com/farmbot/farmbot-web-frontend.git /tmp/farmbot_frontend
rm -rf /tmp/farmbot_frontend/.git
mkdir public/ -p
cp -R /tmp/farmbot_frontend/* public/ 
cd public
npm install webpack
npm install
npm run build
