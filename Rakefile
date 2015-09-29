# Add your own tasks in files placed in lib/tasks ending in .rake,
# for example lib/tasks/capistrano.rake, and they will automatically be available to Rake.

require File.expand_path('../config/application', __FILE__)
FarmBot::Application.load_tasks

Rake::Task["assets:precompile"].enhance do
  # We use a mix of gulp + asset pipeline. Quick fix for now is
  # to piggyback on `rake assets:precompile` so that it gets
  # run on deploy.
  puts '====== Running `gulp build`'
  puts `gulp build`
  puts '====== Done running `gulp build`'
end
