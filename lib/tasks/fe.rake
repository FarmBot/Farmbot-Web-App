PACKAGE_JSON_FILE = "./package.json"
DEPS_KEY          = "dependencies"
DEV_DEPS_KEY      = "devDependencies"
EXCLUDE = [
  {
    packages: ["@types/enzyme"],
    reason: "@types/react",
    version: "3.10.12 (latest working)",
  },
  {
    packages: ["punycode"],
    reason: "dependency needs",
    version: "1.4.1",
  },
  {
    packages: ["eslint"],
    reason: "breaking changes in",
    version: "9",
  },
  {
    packages: ["@typescript-eslint/eslint-plugin"],
    reason: "breaking changes in",
    version: "8",
  },
  {
    packages: ["@typescript-eslint/parser"],
    reason: "breaking changes in",
    version: "8",
  },
  {
    packages: ["react", "react-dom", "react-test-renderer"],
    reason: "not compatible with enzyme",
    version: "3",
  },
  {
    packages: ["@react-three/drei", "@react-three/fiber"],
    reason: "v9 fiber and v10 drei require react",
    version: "19",
  },
  {
    packages: ["jest", "jest-cli", "jest-environment-jsdom"],
    reason: "breaking changes (jsdom window.location) in",
    version: "30",
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

# Fetch latest versions for outdated dependencies.
def fetch_available_upgrades()
  begin
    latest_json = JSON.parse(`npm outdated --json`)
  rescue JSON::ParserError => exception
    latest_json = {}
  end
  latest_versions = {}
  latest_json.each do |dep, data|
    any_excluded = false
    for exclude in EXCLUDE
      excluded = exclude[:packages].include?(dep)
      if excluded
        any_excluded = true
        puts "excluding #{dep} v#{data["latest"]} because of " \
              "#{exclude[:reason]} v#{exclude[:version]}\n"
      end
      if exclude[:reason].include?(dep)
        puts "  #{dep} latest v#{data["latest"]}\n"
      end
    end
    unless any_excluded || data["latest"].nil? || data["latest"].include?("beta")
      latest_versions[dep] = data["latest"]
    end
  end
  return latest_versions
end

# Install dependency updates.
def install_updates
  sh "sudo docker compose run web npm install"
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
      bash_file_string += "    sudo docker compose run web npm install $1\n"
      bash_file_string += "    if [ $? -ne 0 ]; then okay=1; fi\n"
      bash_file_string += "    title \"Typechecking with $1\"\n"
      bash_file_string += "    sudo docker compose run web npm run typecheck\n"
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
        puts "Saved. Use 'sudo docker compose run web npm install' to upgrade."
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
