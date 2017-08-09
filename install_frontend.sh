#!/bin/bash
echo "=========   RUNNING install_frontend.sh"
CURRENT_DIR=$(pwd)

if [ "$NPM_ADDON" ]; then
    echo "=========   NPM ADD ON DETECTED... INSTALLING"
    npm install $NPM_ADDON --save 2>&1
fi

echo "=========   Running Yarn"
yarn install 2>&1
# https://github.com/yarnpkg/yarn/issues/1981
npm rebuild node-sass
# Make webpack executable and compile everything.
echo "=========   Changing Webpack permissions"
chmod +x node_modules/webpack/bin/webpack.js

echo "=========   Running `npm run build`"
npm run build 2>&1

# Move it over to the rails /public directory and install deps
mkdir public/ -p
