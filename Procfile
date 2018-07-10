log_service:      bin/rails r lib/log_service_runner.rb
resource_service: bin/rails r lib/resource_service_runner.rb
web:              bundle exec passenger start -p $PORT -e $RAILS_ENV --max-pool-size 3
worker:           bundle exec rake jobs:work
