#!/bin/bash

rm -rf /tmp/farmbot_frontend
mkdir /tmp/farmbot_frontend
git clone https://github.com/farmbot/farmbot-web-frontend.git /tmp/farmbot_frontend
rm -rf /tmp/farmbot_frontend/.git
mkdir public/ -p
cp -R /tmp/farmbot_frontend/* public/ 
cd public
npm install -g webpack --no-bin-links 2>&1
npm install --no-bin-links 2>&1
chmod +x node_modules/webpack/bin/webpack.js
npm run build 2>&1
