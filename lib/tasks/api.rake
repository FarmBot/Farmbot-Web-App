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
  BIG_WARNING = <<~END
    ░██████░░███████░░█████░░░██████░░  You have recently upgraded your server
    ░██░░░░░░░░██░░░░██░░░██░░██░░░██░  from version 6 to version 7.
    ░██████░░░░██░░░░██░░░██░░██████░░  This requires action on your part.
    ░░░░░██░░░░██░░░░██░░░██░░██░░░░░░  Please read the instructions below
    ░██████░░░░██░░░░░████░░░░██░░░░░░  carefully.

    The biggest change from version 6 to version 7 is the addition of Docker for
    managing services. This simplifies server setup because all software runs
    inside of a container (no need to install Postgres or Ruby on your local
    machine). Unfortunately, this change required a number of non-compatible
    changes to the codebase, particularly related to the database and
    configuration management.

    The biggest changes for v7:
      * Use a `.env` file instead of `application.yml`
      * The database runs in a container
      * The `mqtt/` directory was renamed `docker_configs/` (this directory
        contains passwords which were previously `gitignore`ed)

    Please perform the following steps to upgrade:

    1. Follow v7 installation steps found in "ubuntu_example.sh". You will need
       to skip certain steps. The skipable steps are listed in the instructions.

    2. Stop using `rails api:start` and `rails mqtt:start` commands. The new
       startup command is `sudo docker-compose up` See "ubuntu_example.sh" for
       details. All services run in a single command now.

    3. If you wish to continue using your current database:
       a. To keep using the old database (v6) database, set the `DATABASE_URL`
          ENV var to match the following format:
            `postgres://username:password@host_name:5432/database_name`
       b. Migrate the database to the new container-based DB manually:
          https://stackoverflow.com/questions/1237725/copying-postgresql-database-to-another-server
          (NOTE: We do not provide database migration support- consult
           StackOverflow and the PostgreSQL docs)
       c. Start a fresh database by following directions in `ubuntu_setup.sh`.
          Old data will be lost.

    4. Update database.yml to match https://github.com/FarmBot/Farmbot-Web-App/blob/staging/config/database.yml

    5. Migrate the contents of `config/application.yml` to `.env`. Ensure you
       have removed "quotation marks" and that all entries are `key=value` pairs.

    6. (SECURITY CRITICAL) Migrate `mqtt/` folder to `docker_configs/` and
       delete `mqtt/`
  END
end

namespace :api do
  desc "Runs pending email digests. "\
       "Use the `FOREVER` ENV var to continually check."
  task log_digest: :environment do
    ENV["FOREVER"] ? loop { check_for_digests } : check_for_digests
  end

  # TODO: Remove in dec 2018
  desc "Deprecated. Will be removed in December of 2018"
  task(:start) { puts V7Migration::BIG_WARNING }

  desc "Run Rails _ONLY_. No Webpack."
  task only: :environment do
    sh "sudo docker-compose up --scale webpack=0"
  end

  desc "Pull the latest Farmbot API version"
  task(update: :environment) { same_thing }

  desc "Pull the latest Farmbot API version"
  task(upgrade: :environment) { same_thing }
end
