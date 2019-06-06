worker:         bundle exec rake jobs:work
rabbit_workers: bin/rails r lib/rabbit_workers.rb
web:            bundle exec passenger start -p $PORT -e $RAILS_ENV --max-pool-size 2
# This will perform a hard refresh on all connected browsers.
release:        rails r "User.delay(run_at: 5.minutes.from_now).refresh_everyones_ui"
