web:         bundle exec passenger start -p $PORT -e $RAILS_ENV --max-pool-size 3
log_service: bin/rails r lib/log_service.rb
worker:      bundle exec rake jobs:work
