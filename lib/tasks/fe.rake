PACKAGE_JSON_FILE = "./package.json"
DEPS_KEY          = "dependencies"
DEV_DEPS_KEY      = "devDependencies"
EXCLUDE = [
  {
    packages: ["typescript"],
    reasons: ["eslint"],
  }
]

# Load package.json as JSON.
def load_package_json()
  return JSON.parse(File.open(PACKAGE_JSON_FILE).read)
end

# Save JSON to package.json.
def save_package_json(json)
  File.open(PACKAGE_JSON_FILE, "w") { |file|
    file.write(JSON.pretty_generate(json))
    file.puts
  }
end

# Parse bun output with current and latest versions.
def parse_bun_outdated_versions(output)
  versions = {}
  ansi_escape = /(?:\e|\\e)\[[0-9;]*m/

  output.each_line do |line|
    cleaned_line = line.gsub(ansi_escape, "").strip
    next if cleaned_line.empty?

    if cleaned_line.start_with?("│")
      columns = cleaned_line.split("│").map(&:strip)
      next unless columns.length >= 5
      next if columns[1] == "Package"

      package = columns[1].sub(/\s+\(dev\)\z/, "")
      versions[package] = { current: columns[2], latest: columns[4] }
      next
    end

    next unless cleaned_line.include?(" => ")

    package, latest = cleaned_line.split(" => ", 2)
    package = package.delete_prefix('"').delete_suffix('"')
    latest = latest.delete_prefix('"').delete_suffix('"')
    next if package == "Package"

    versions[package.sub(/\s+\(dev\)\z/, "")] = { current: nil, latest: latest }
  end

  versions
end

# Parse the latest versions from bun output.
def parse_bun_outdated(output)
  parse_bun_outdated_versions(output).transform_values { |data| data[:latest] }
end

# Fetch latest versions for outdated dependencies.
def fetch_available_upgrades()
  versions = {}
  begin
    output = `bun outdated`
    return {} if output.nil? || output.strip.empty?
    versions = parse_bun_outdated_versions(output)
  rescue Errno::ENOENT
    versions = {}
  end

  outdated_dependencies = versions.keys
  missing_reasons = EXCLUDE
    .flat_map { |exclude| exclude[:reasons] }
    .uniq
    .reject { |reason| versions.key?(reason) }
  unless missing_reasons.empty?
    package_json = load_package_json()
    missing_reasons.each do |reason|
      version = package_json.dig(DEPS_KEY, reason) ||
        package_json.dig(DEV_DEPS_KEY, reason)
      versions[reason] = { current: version, latest: version } if version
    end
  end

  latest_versions = {}
  outdated_dependencies.each do |dep|
    data = versions[dep]
    current = data[:current]
    latest = data[:latest]
    any_excluded = false
    for exclude in EXCLUDE
      excluded = exclude[:packages].include?(dep)
      reason_dependencies = exclude[:reasons]
      if excluded
        any_excluded = true
        puts "excluding #{dep} v#{latest} because:\n"
        reason_dependencies.each do |reason|
          reason_current = versions.dig(reason, :current)
          reason_latest = versions.dig(reason, :latest)
          puts " #{reason} v#{reason_current} requires #{dep} v#{current} " \
                "(#{reason} latest v#{reason_latest})\n"
        end
      end
    end
    unless any_excluded || latest.nil? || latest.include?("beta")
      latest_versions[dep] = latest
    end
  end
  return latest_versions
end

# Install dependency updates.
def install_updates
  sh "sudo docker compose run web bun install"
end

namespace :fe do
  desc "Update frontend dependencies to the latest available."\
       "This often causes breakage. Use only for development."
  task update_deps: :environment do
    puts "begin?"; if !user_typed?("developer"); puts "done."; exit end
    available_upgrades = fetch_available_upgrades()
    if available_upgrades.length > 0
      max_key_length     = available_upgrades.keys.max_by(&:length).length
      package_json       = load_package_json()

      bash_file_string = "#!/bin/bash\n\n"
      bash_file_string += "# CONTENTS WILL BE OVERWRITTEN BY `rake fe:upgrade_deps`\n\n"
      bash_file_string += "title() { echo -e \"\\n$1\\n" + "=" * 100 + "\\n\"; }\n\n"
      bash_file_string += "check_dep() {\n"
      bash_file_string += "    okay=0\n"
      bash_file_string += "    title \"Installing $1\"\n"
      bash_file_string += "    sudo docker compose run web bun add $1\n"
      bash_file_string += "    if [ $? -ne 0 ]; then okay=1; fi\n"
      bash_file_string += "    title \"Typechecking with $1\"\n"
      bash_file_string += "    sudo docker compose run web bun run typecheck\n"
      bash_file_string += "    if [ $? -ne 0 ]; then okay=1; fi\n"
      bash_file_string += "    title \"Building with $1\"\n"
      bash_file_string += "    sudo docker compose run web rake assets:precompile\n"
      bash_file_string += "    if [ $? -ne 0 ]; then okay=1; fi\n"
      bash_file_string += "    if [ $okay -ne 0 ]; then\n"
      bash_file_string += "        title \"\"\n"
      bash_file_string += "        title \"Failed on: $1\"\n"
      bash_file_string += "        exit 1\n"
      bash_file_string += "    fi\n"
      bash_file_string += "}\n\n"
      puts
      puts "=" * 40
      puts "#{PACKAGE_JSON_FILE} AVAILABLE UPDATES:"
      available_upgrades.each do |dep, new_version|
        deps_key = DEPS_KEY
        current_version = package_json[deps_key][dep]
        if current_version.nil?
          deps_key = DEV_DEPS_KEY
          current_version = package_json[deps_key][dep]
        end
        padding         = ' ' * (max_key_length - dep.length)
        puts "  #{dep} #{padding} #{current_version} -> #{new_version}"
        bash_file_string += "check_dep \"#{dep}@#{new_version}\"\n"
        package_json[deps_key][dep] = new_version
      end
      puts "=" * 40

      File.open("scripts/upgrade_deps.sh", "w") { |file|
        file.write(bash_file_string)
      }

      puts "Type 'save' to update #{PACKAGE_JSON_FILE}, enter to abort."
      if user_typed?("save")
        save_package_json(package_json)
        puts "Saved. Use 'sudo docker compose run web bun install' to upgrade."
      else
        puts "Aborted. No changes made."
        puts "Run the following script to upgrade incrementally: `bash scripts/upgrade_deps.sh`"
      end
    else
      puts "\n"
      puts "No updates available."
    end
  end
end
