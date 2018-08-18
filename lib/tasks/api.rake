# Going to make an `update` AND `upgrade` task that do the same thing
def same_thing
  sh "git pull https://github.com/FarmBot/Farmbot-Web-App.git master"
  sh "bundle install"
  sh "yarn install"
  sh "rails db:migrate"
end

def check_for_digests
  Log
    .where(sent_at: nil, created_at: 1.day.ago...Time.now)
    .where(Log::IS_EMAIL_ISH)
    .where
    .not(Log::IS_FATAL_EMAIL)
    .pluck(:device_id)
    .uniq
    .map do |id|
      device = Device.find(id)
      puts "Sending log digest to device \##{id} (#{device.name})"
      LogDeliveryMailer.log_digest(device).deliver
    end
  sleep 10
end

namespace :api do
  desc "Runs pending email digests. "\
       "Use the `FOREVER` ENV var to continually check."
  task log_digest: :environment do
    ENV["FOREVER"] ? loop { check_for_digests } : check_for_digests
  end

  desc "Run Webpack and Rails"
  task start: :environment do
    sh "PORT=3000 bundle exec foreman start --procfile=Procfile.dev"
  end

  desc "Run Rails _ONLY_. No Webpack."
  task only: :environment do
    sh "PORT=3000 bundle exec foreman start --procfile=Procfile.api_only"
  end

  desc "Pull the latest Farmbot API version"
  task(update: :environment) { same_thing }

  desc "Pull the latest Farmbot API version"
  task(upgrade: :environment) { same_thing }

end
