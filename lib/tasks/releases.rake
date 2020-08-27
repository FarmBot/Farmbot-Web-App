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
  desc "Publish the latest release found on farmbot/farmbot_os github org"
  task publish: :environment do
    puts "Downloading releases...."
    file = URI.open(Release::GITHUB_URL)
    raw_json = file.read
    json = JSON.parse(raw_json, symbolize_names: true)
    releases = Releases::Parse.run!(json).map { |params| Releases::Create.run!(params) }.map do |release|
      puts "Creating release..."
      is_new = release.saved_change_to_attribute?(:id)
      tpl = is_new ? NEW_RELEASE_TEMPLATE : OLD_RELEASE_TEMPLATE
      params = release.as_json.symbolize_keys
      puts tpl % params
    end
  end
end
