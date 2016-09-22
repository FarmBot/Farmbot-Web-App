#!/bin/bash
rm -rf /tmp/farmbot_frontend
mkdir /tmp/farmbot_frontend
git clone https://github.com/rickcarlino/farmbot-web-frontend.git /tmp/farmbot_frontend
rm -rf /tmp/farmbot_frontend/.git
mkdir public/ -p
cp -R /tmp/farmbot_frontend/* public/ 
cd public
npm install
npm run build
