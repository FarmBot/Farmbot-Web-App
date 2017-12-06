web:         bin/rails server -p $PORT -e $RAILS_ENV
log_service: bin/rails r lib/log_service.rb
worker:      bundle exec rake jobs:work
