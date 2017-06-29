#!/bin/bash
echo "=========   RUNNING install_frontend.sh"
CURRENT_DIR=$(pwd)
export BUILT_AT=$(git log --pretty=format:'%h' -1)
echo "=========   Going into frontend/ directory"

cd frontend

if [ "$NPM_ADDON" ]; then
    echo "=========   NPM ADD ON DETECTED... INSTALLING"
    npm install $NPM_ADDON --save 2>&1
fi

echo "=========   NPM INSTALLING"
npm install 2>&1

# Make webpack executable and compile everything.
echo "=========   Changing Webpack permissions"
chmod +x node_modules/webpack/bin/webpack.js

echo "=========   Running `npm run build`"
npm run build 2>&1

echo "=========   Going back into Rails dir"
cd $CURRENT_DIR
# Move it over to the rails /public directory and install deps

echo "=========   Overwrite public/"
mkdir public/ -p

echo "=========   Copying FE into public/ folder"
cp -R frontend/public/* public/
