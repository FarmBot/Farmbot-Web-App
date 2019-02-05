
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
    puts "Running log digest loop..."
    ENV["FOREVER"] ? loop { check_for_digests } : check_for_digests
  end

  desc "Run Rails _ONLY_. No parcel."
  task only: :environment do
    sh "sudo docker-compose up --scale parcel=0"
  end

  desc "Serve javascript assets (via Parcel bundler)"
  task serve_assets: :environment do
    css    = DashboardController::CSS_INPUTS.values
    js     = DashboardController::JS_INPUTS.values
    assets = (js + css)
      .sort
      .uniq
      .map { |x| "frontend" + x }
      .join(" ")

      cli = [
      "node_modules/parcel-bundler/bin/cli.js",
      "watch",
      assets,
      "--out-dir public/dist",
      "--public-url /dist",
      # "--no-hmr",
      "--hmr-hostname #{ENV.fetch("API_HOST")}",
      "--hmr-port 3808",
      # https://github.com/parcel-bundler/parcel/issues/2599#issuecomment-459131481
      # https://github.com/parcel-bundler/parcel/issues/2607
      "--no-source-maps",
    ].join(" ")
    puts "=== Running: \n#{cli}"
    sh cli
  end

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
        .update_attributes!(value: data.to_s)
    end
  end
end
