background_jobs: bundle exec rake jobs:work
log_worker:      bin/rails r lib/log_service_runner.rb
resource_worker: bin/rails r lib/resource_service_runner.rb
web:             bundle exec passenger start -p $PORT -e $RAILS_ENV --max-pool-size 3
