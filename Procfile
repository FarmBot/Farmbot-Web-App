worker:          bundle exec rake jobs:work
rabbit_workers:  bin/rails r lib/rabbit_workers.rb
web:             bundle exec passenger start -p $PORT -e $RAILS_ENV --max-pool-size 3
