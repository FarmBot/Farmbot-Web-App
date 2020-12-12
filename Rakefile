# Add your own tasks in files placed in lib/tasks ending in .rake,
# for example lib/tasks/capistrano.rake, and they will automatically be available to Rake.

require File.expand_path("../config/application", __FILE__)
FarmBot::Application.load_tasks

# Thanks:
# https://dmitryshvetsov.com/how-to-use-webpacker-with-npm-instead-of-yarn-rails-guide
WE_DONT_USE_THESE_TASKS = [
  "yarn:install",
  "webpacker:yarn_install",
  "webpacker:check_yarn",
]

WE_DONT_USE_THESE_TASKS.map do |task|
  Rake::Task[task].clear if Rake::Task.task_defined?(task)
end
