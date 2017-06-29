#!/bin/bash

CURRENT_DIR=$(pwd)
# Clone into a temp folder...
rm -rf /tmp/farmbot_frontend
mkdir /tmp/farmbot_frontend

cd frontend

if [ "$NPM_ADDON" ]; then
    echo "NPM ADD ON DETECTED... INSTALLING"
    npm install $NPM_ADDON --save 2>&1
fi

npm install 2>&1

# Make webpack executable and compile everything.
chmod +x node_modules/webpack/bin/webpack.js
npm run build 2>&1

cd $CURRENT_DIR
# Move it over to the rails /public directory and install deps
mkdir public/ -p

cp -R frontend/public/* public/
