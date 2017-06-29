web: bin/rails server -p $PORT -e $RAILS_ENV
worker: worker bundle exec rake jobs:work
webpack: ./frontend/node_modules/webpack/bin/webpack.js --config frontend/tools/webpack.config.dev.js
