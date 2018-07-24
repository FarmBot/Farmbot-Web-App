# Going to make an `update` AND `upgrade` task that do the same thing
def same_thing
  sh "git pull https://github.com/FarmBot/Farmbot-Web-App.git master"
  sh "bundle install"
  sh "yarn install"
  sh "rails db:migrate"
end

namespace :api do
  desc "Run Webpack and Rails"
  task start: :environment do
    sh "PORT=3000 bundle exec foreman start --procfile=Procfile.dev"
  end

  desc "Run Rails _ONLY_. No Webpack."
  task only: :environment do
    sh "PORT=3000 bundle exec foreman start --procfile=Procfile.api_only"
  end

  desc "Run __LEGACY__ Webpack and Rails"
  task legacy_start: :environment do
    sh "PORT=3000 bundle exec foreman start --procfile=mqtt_legacy/Procfile.legacy"
  end

  desc "Pull the latest Farmbot API version"
  task(update: :environment) { same_thing }

  desc "Pull the latest Farmbot API version"
  task(upgrade: :environment) { same_thing }

end
