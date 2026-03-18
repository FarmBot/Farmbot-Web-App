require "shellwords"

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
  sh "sudo docker system prune -af --volumes"
  sh "sudo rm -rf docker_volumes/"
rescue => exception
  puts exception.message
  puts "Reset failed. Was there nothing to destroy?"
end

def rebuild_deps
  sh "sudo docker compose run web bundle install"
  sh "sudo docker compose run web bun install"
  sh "sudo docker compose run web bundle exec rails db:setup"
  sh "sudo docker compose run web rake keys:generate"
  sh "sudo docker compose run web bundle exec rake assets:precompile"
end

def user_typed?(word)
  STDOUT.flush
  STDIN.gets.chomp.downcase.include?(word.downcase)
end

def truthy_env?(key)
  value = ENV[key]
  return false if value.nil?

  value.match?(/\A(true|1|yes|y)\z/i)
end

namespace :api do
  desc "Runs pending email digests. " \
       "Use the `FOREVER` ENV var to continually check."
  task log_digest: :environment do
    puts "Running log digest loop..."
    ENV["FOREVER"] ? loop { check_for_digests } : check_for_digests
  end

  desc "Run Rails _ONLY_. No asset server."
  task only: :environment do
    sh "sudo docker compose up --scale assets=0"
  end

  def asset_js_entries
    DashboardController::JS_INPUTS.values.map do |path|
      File.join("frontend", path)
    end
  end

  def asset_css_entries
    DashboardController::CSS_INPUTS.values.map do |path|
      input = File.join("frontend", path)
      output = File.join(
        DashboardController::PUBLIC_OUTPUT_DIR,
        path.gsub(/\.scss$/, ".css")
      )
      [input, output]
    end
  end

  def asset_env
    {
      "ASSET_JS_ENTRIES" => asset_js_entries.to_json,
      "ASSET_CSS_ENTRIES" => asset_css_entries.to_json,
      "ASSET_OUTDIR" => DashboardController::PUBLIC_OUTPUT_DIR,
      "ASSET_PUBLIC_PATH" => "#{DashboardController::OUTPUT_URL}/",
      "ASSET_PORT" => ENV.fetch("ASSET_PORT", "3808"),
    }
  end

  def run_bun_assets(script_path)
    env = asset_env
    env_string = env.map { |k, v| "#{k}=#{Shellwords.escape(v)}" }.join(" ")
    sh "#{env_string} bun #{script_path}"
  end

  def clean_assets
    # Clear out cache and previous builds on initial load.
    sh [
      "rm -rf",
      DashboardController::CACHE_DIR,
      DashboardController::PUBLIC_OUTPUT_DIR,
      "public/assets/monaco",
    ].join(" ") unless truthy_env?("NO_CLEAN")
  end

  # three-stdlib still references LuminanceFormat, which was removed in three.
  # Replace it with RedFormat before bundling to keep bun happy.
  def patch_three_stdlib
    [
      "node_modules/three-stdlib/postprocessing/GlitchPass.js",
      "node_modules/three-stdlib/postprocessing/SSAOPass.js",
    ].each do |path|
      next unless File.exist?(path)

      content = File.read(path)
      updated = content.gsub(/,\s*LuminanceFormat\b/, "")
      updated = updated.gsub(/\bLuminanceFormat\b/, "RedFormat")
      updated = updated.gsub(/RedFormat\s*,\s*RedFormat/, "RedFormat")
      File.write(path, updated) if updated != content
    end

    [
      "node_modules/three-stdlib/postprocessing/GlitchPass.cjs",
      "node_modules/three-stdlib/postprocessing/SSAOPass.cjs",
    ].each do |path|
      next unless File.exist?(path)

      content = File.read(path)
      updated = content.gsub("LuminanceFormat", "RedFormat")
      File.write(path, updated) if updated != content
    end
  end

  def clean_build_files
    # clear out build files, keeping public assets
    sh [
      "rm -rf",
      "node_modules",
      "bin/node",
    ].join(" ")
  end

  def print_dir_sizes(label)
    puts label
    cmd = "du -sh -- %<paths>s 2>/dev/null | sort -hr | head -n 5 || true"
    sh format(cmd, paths: "* .[^.]*")
    %w[vendor public public/assets bin].each do |dir|
      sh format(cmd, paths: "#{dir}/* #{dir}/.[^.]*")
    end
  end

  def add_monaco
    src = "node_modules/monaco-editor/min/vs"
    dst = "public/assets/monaco"
    lua_src = "node_modules/monaco-editor/esm/vs"
    sh "mkdir -p public/assets/monaco"
    sh "cp -r #{src}/assets #{dst}"
    sh "cp -r #{src}/editor #{dst}"
    sh "cp -r #{src}/basic-languages #{dst}"
    sh "cp -r #{src}/loader.js #{dst}"
    sh "cp -r #{src}/workers-*.js #{dst}"
    sh "cp -r #{src}/monaco.contribution-*.js #{dst}"
    sh "cp -r #{src}/editor.api-*.js #{dst}"
    sh "cp -r #{src}/nls.messages-loader.js #{dst}"
    sh "cp -r #{src}/lua-*.js #{dst}"
    sh "cp -r #{lua_src}/basic-languages/lua #{dst}/basic-languages"
  end

  desc "Serve javascript assets (via Bun bundler)."
  task serve_assets: :environment do
    clean_assets
    add_monaco
    patch_three_stdlib
    run_bun_assets "scripts/bun/dev_server.ts"
  end

  desc "Don't call this directly. Use `rake assets:precompile`."
  task assets_compile: :environment do
    clean_assets
    add_monaco
    patch_three_stdlib
    run_bun_assets "scripts/bun/build.ts"
  end

  desc "Don't call this directly. Use `rake assets:clean`."
  task assets_clean: :environment do
    print_dir_sizes("Before clean_build_files:")
    clean_build_files
    print_dir_sizes("After clean_build_files:")
  end

  desc "Clean out old demo accounts"
  task clean_demo_accounts: :environment do
    users = User
      .where("email ILIKE '%@farmbot.guest%'")
      .where("updated_at < ?", 1.hour.ago)
    Device
      .where(id: users.pluck(:device_id))
      .update_all(mounted_tool_id: nil)
    users.map { |u| u.device.folders.update_all(parent_id: nil) }
    users.destroy_all
  end

  desc "Reset _everything_, including your database"
  task :reset do
    puts "This is going to destroy _ALL_ of your local Farmbot SQL data and " \
         "configs. Type 'destroy' to continue, enter to abort."
    if user_typed?("destroy")
      hard_reset_api
      puts "Done. Type 'build' to re-install dependencies, enter to abort."
      rebuild_deps if user_typed?("build")
    end
  end

  RELEASES_URL = "https://api.github.com/repos/farmbot/farmbot_os/releases"
  VERSION = "tag_name"
  TIMESTAMP = "created_at"
  PRERELEASE = "prerelease"

  def deprecate!
    # Get current version
    version_str = GlobalConfig.dump.fetch("FBOS_END_OF_LIFE_VERSION")
    # Convert it to Gem::Version for easy comparisons (>, <, ==, etc)
    current_version = Gem::Version::new(version_str)
    # 60 days is the current policy.
    cutoff = 60.days.ago
    # Download release data from github
    string_page_1 = URI.parse("#{RELEASES_URL}?per_page=100&page=1").open.read
    string_page_2 = URI.parse("#{RELEASES_URL}?per_page=100&page=2").open.read
    data = JSON.parse(string_page_1).push(*JSON.parse(string_page_2))
      .map { |x| x.slice(VERSION, TIMESTAMP, PRERELEASE) } # Only grab keys that matter
      .reject { |x| x.fetch(VERSION).include?("-") } # Remove RC/Beta releases
      .reject { |x| x.fetch(PRERELEASE) } # Remove pre-releases
      .map do |x|
      # Convert string-y version/timestamps to Real ObjectsTM
      version = Gem::Version::new(x.fetch(VERSION).gsub("v", ""))
      time = DateTime.parse(x.fetch(TIMESTAMP))
      Pair.new(version, time)
    end
      .select do |pair|
      # Grab versions that are > current version and outside of cutoff window
      (pair.head >= current_version) && (pair.tail < cutoff)
    end
      .sort_by { |p| p.tail } # Sort by release date
      .last(2) # Grab 2 latest versions (closest to cutoff)
      .first # Give 'em some leeway, grabbing the 2nd most outdated version.
      .try(:head) # We might already be up-to-date?
    if data # ...or not
      puts "Setting new support target to #{data.to_s}"
      GlobalConfig # Set the new oldest support version.
        .find_by(key: "FBOS_END_OF_LIFE_VERSION")
        .update!(value: data.to_s)
    end
  end

  def trim_logs
    Device.all.map{ |device| device.trim_excess_logs }
  end

  desc "Deprecate old FBOS version, delete inactive accounts, etc.."
  task tidy: :environment do
    deprecate!
    InactiveAccountJob.perform_later
    trim_logs
  end
end

namespace :assets do
  desc "Compile frontend assets."
  task precompile: "api:assets_compile"

  desc "Clean frontend build artifacts."
  task clean: "api:assets_clean"
end
