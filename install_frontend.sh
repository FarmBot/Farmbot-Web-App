#!/bin/bash

rm -rf /tmp/farmbot_frontend
mkdir /tmp/farmbot_frontend
git clone https://github.com/farmbot/farmbot-web-frontend.git /tmp/farmbot_frontend
rm -rf /tmp/farmbot_frontend/.git
mkdir public/ -p
cp -R /tmp/farmbot_frontend/* public/ 
cd public
npm install -g webpack --no-bin-links >> frontend_build.log
npm install webpack --no-bin-links >> frontend_build.log
npm install i18n-webpack-plugin --no-bin-links -g >> frontend_build.log
npm install --no-bin-links >> frontend_build.log
npm run build >> frontend_build.log
