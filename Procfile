worker:         bundle exec rake jobs:work
rabbit_workers: bin/rails r lib/rabbit_workers.rb
web:            bundle exec passenger start -p $PORT -e $RAILS_ENV --max-pool-size $MAX_POOL_SIZE
# This will perform a hard refresh on all connected browsers.
release:        rails r "User.refresh_everyones_ui" && rails db:migrate && (bundle exec rake hook:release_info || true)
