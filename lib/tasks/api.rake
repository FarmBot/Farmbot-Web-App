# Going to make an `update` AND `upgrade` task that do the same thing
def same_thing
  sh "git pull https://github.com/FarmBot/Farmbot-Web-App.git master"
  sh "sudo docker-compose run web bundle install"
  sh "sudo docker-compose run web npm install"
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
  sleep 10.minutes
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
       See `example.env` for a properly formatted example.

    6. (SECURITY CRITICAL) delete `mqtt/`
  END
end

def hard_reset_api
  sh "sudo docker stop $(sudo docker ps -a -q)"
  sh "sudo docker rm $(sudo docker ps -a -q)"
  sh "sudo rm -rf docker_volumes/"
rescue => exception
  puts exception.message
  puts "Reset failed. Was there nothing to destroy?"
end

def rebuild_deps
  sh "sudo docker-compose run web bundle install"
  sh "sudo docker-compose run web npm install"
  sh "sudo docker-compose run web bundle exec rails db:setup"
  sh "sudo docker-compose run web rake keys:generate"
  sh "sudo docker-compose run web npm run build"
end

def user_typed?(word)
  STDOUT.flush
  STDIN.gets.chomp.downcase.include?(word.downcase)
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

  desc "Reset _everything_, including your database"
  task :reset do
    puts "This is going to destroy _ALL_ of your local Farmbot SQL data and "\
         "configs. Type 'destroy' to continue, enter to abort."
    if user_typed?("destroy")
      hard_reset_api
      puts "Done. Type 'build' to re-install dependencies, enter to abort."
      rebuild_deps if user_typed?("build")
    end
  end

  VERSION   = "tag_name"
  TIMESTAMP = "created_at"

  desc "Update GlobalConfig to deprecate old FBOS versions"
  task deprecate: :environment do
    # Get current version
    version_str     = GlobalConfig.dump.fetch("FBOS_END_OF_LIFE_VERSION")
    # Convert it to Gem::Version for easy comparisons (>, <, ==, etc)
    current_version = Gem::Version::new(version_str)
    # 60 days is the current policy.
    cutoff   = 60.days.ago
    # Download release data from github
    stringio = open("https://api.github.com/repos/farmbot/farmbot_os/releases")
    string   = stringio.read
    data     = JSON
    .parse(string)
    .map    { |x| x.slice(VERSION, TIMESTAMP)    } # Only grab keys that matter
    .reject { |x| x.fetch(VERSION).include?("-") } # Remove RC/Beta releases
    .map   do |x|
      # Convert string-y version/timestamps to Real ObjectsTM
      version = Gem::Version::new(x.fetch(VERSION).gsub("v", ""))
      time    = DateTime.parse(x.fetch(TIMESTAMP))
      Pair.new(version, time)
    end
    .select do |pair|
      # Grab versions that are > current version and outside of cutoff window
      (pair.head > current_version) && (pair.tail < cutoff)
    end
    .sort_by { |p| p.tail } # Sort by release date
    .last(2) # Grab 2 latest versions (closest to cuttof)
    .first   # Give 'em some leeway, grabbing the 2nd most outdated version.
    .try(:head) # We might already be up-to-date?
    if data # ...or not
      puts "Setting new support target to #{data.to_s}"
      GlobalConfig # Set the new oldest support version.
        .find_by(key: "FBOS_END_OF_LIFE_VERSION")
        .update_attributes!(value: data.to_is)
    end
  end
end
