PACKAGE_JSON_FILE = "./package.json"
DEPS_KEY          = "dependencies"
DEV_DEPS_KEY      = "devDependencies"
EXCLUDE           = []

# Load package.json as JSON.
def load_package_json()
  return JSON.parse(URI.open(PACKAGE_JSON_FILE).read)
end

# Save JSON to package.json.
def save_package_json(json)
  URI.open(PACKAGE_JSON_FILE, "w") { |file|
    file.write(JSON.pretty_generate(json))
    file.puts
  }
end

# Fetch latest versions for outdated dependencies.
def fetch_available_upgrades()
  begin
    latest_json = JSON.parse(`npm outdated --json`)
  rescue JSON::ParserError => exception
    latest_json = {}
  end
  latest_versions = {}
  latest_json.each do |dep, data|
    unless EXCLUDE.include?(dep) || data["latest"].nil? ||
      data["latest"].include?("beta")
      latest_versions[dep] = data["latest"]
    end
  end
  return latest_versions
end

# Install dependency updates.
def install_updates
  sh "sudo docker-compose run web npm install"
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
        package_json[deps_key][dep] = new_version
      end
      puts "=" * 40

      puts "Type 'save' to update #{PACKAGE_JSON_FILE}, enter to abort."
      if user_typed?("save")
        save_package_json(package_json)
        puts "Saved. Use 'sudo docker-compose run web npm install' to upgrade."
      else
        puts "Aborted. No changes made."
      end
    else
      puts "No updates available."
    end
  end
end
