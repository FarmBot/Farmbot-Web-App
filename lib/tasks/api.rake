# Going to make an `update` AND `upgrade` task that do the same thing
def same_thing
  sh "git pull https://github.com/FarmBot/Farmbot-Web-App.git master"
  sh "bundle install"
  sh "yarn install"
  sh "rails db:migrate"
end

namespace :api do
  desc "Just testing things out"
  task log_digest: :environment do
    puts "=== Looking for digests..."
    Log
      .where(sent_at: nil, created_at: 1.day.ago...Time.now)
      .where(Log::IS_EMAIL_ISH)
      .where
      .not(Log::IS_FATAL_EMAIL)
      .pluck(:device_id)
      .uniq
      .tap {|ids| puts "=== Found #{ids.count} digests..."}
      .map do |id|
        device = Device.find(id)
        puts "=== Sending email digest to #{device.name}: #{device.id}"
        LogDeliveryMailer.log_digest(device)
      end
    puts "=== Done."
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
