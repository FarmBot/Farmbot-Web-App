# Going to make an `update` AND `upgrade` task that do the same thing
def same_thing
  sh "git pull https://github.com/FarmBot/Farmbot-Web-App.git master"
  sh "sudo docker-compose run web bundle install"
  sh "sudo docker-compose run web yarn install"
  sh "sudo docker-compose run web rails db:migrate"
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

class V7Migration
  BIG_WARNING =   <<~END
    ░██████░░███████░░█████░░░██████░░  You have recently upgraded your server
    ░██░░░░░░░░██░░░░██░░░██░░██░░░██░  from version 6 to version 7.
    ░██████░░░░██░░░░██░░░██░░██████░░  This requires action on your part.
    ░░░░░██░░░░██░░░░██░░░██░░██░░░░░░  Please read the instructions below
    ░██████░░░░██░░░░░████░░░░██░░░░░░  carefully.

    1. Follow v7 installation found in "ubuntu_example.sh". You will need to
       skip certain steps. The skipable steps are listed in the instructions.

    2. Stop using `rails api:start` and `rails mqtt:start` commands. The new
       startup command is `sudo docker-compose up` See "ubuntu_example.sh" for
       details.

    3. If you wish to continue using your current database:
       a. Set `DATABASE_URL` ENV var to match the format of
          postgres://username:password@host_name:5432/database_name
       b. Migrate the database to the new container-based DB manually:
          https://stackoverflow.com/questions/1237725/copying-postgresql-database-to-another-server

    4. Update database.yml
    5. Remove quotes from application.yml

    (important) Migrate `mqtt/` folder to `docker_configs/`.
       Type "continue" and press enter to
  END
  def run
    explain_situation
    move_mqtt_folder
    migration_application_yml
  end

  def explain_situation
  end

  def move_mqtt_folder
  end

  def migration_application_yml
  end
end

namespace :api do
  desc "Runs pending email digests. "\
       "Use the `FOREVER` ENV var to continually check."
  task log_digest: :environment do
    ENV["FOREVER"] ? loop { check_for_digests } : check_for_digests
  end

  desc "Run Webpack and Rails"
  task start: :environment do
    puts "Perhaps you meant `sudo docker-compose up`?"
  end

  desc "Pull the latest Farmbot API version"
  task(update: :environment) { same_thing }

  desc "Pull the latest Farmbot API version"
  task(upgrade: :environment) { same_thing }
end
