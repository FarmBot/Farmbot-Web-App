require "open-uri"

NEW_RELEASE_TEMPLATE = "
NEW RELEASE:
=============
Image URL: %{image_url}
Version:   %{version}
Platform:  %{platform}
Channel:   %{channel}
"

OLD_RELEASE_TEMPLATE = "
NOT SAVING %{platform} %{version} (%{channel})
"

namespace :releases do
  desc "Send upgrade notification to devices that are online"
  task notify: :environment do
    Devices::UnattendedUpgrade.delay.run!()
  end

  desc "Publish the latest release found on farmbot/farmbot_os github org"
  task publish: :environment do
    uri = "https://api.github.com/repos/farmbot/farmbot_os/releases"
    file = URI.open(uri)
    raw_json = file.read
    json = JSON.parse(raw_json, symbolize_names: true).pluck(:tag_name)
    choices = json.first(9).sort.reverse
    puts "=== AVAILABLE RELEASES ==="
    choices.each_with_index do |version, index|
      puts "#{index}) #{version}"
    end
    puts "Select a release to publish."
    version = choices.fetch(STDIN.gets.chomp.to_i)
    real_url = "https://api.github.com/repos/farmbot/farmbot_os/releases/tags/#{version}"
    json = JSON.parse(URI.open(real_url).read, symbolize_names: true)
    releases = Releases::Parse.run!(json).map { |params| Releases::Create.run!(params) }.map do |release|
      is_new = release.saved_change_to_attribute?(:id)
      tpl = is_new ? NEW_RELEASE_TEMPLATE : OLD_RELEASE_TEMPLATE
      params = release.as_json.symbolize_keys
      puts tpl % params
    end
  end
end
