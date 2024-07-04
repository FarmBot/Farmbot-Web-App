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
  module ReleaseTask
    def self.download_metadata(tag_name)
      real_url = "https://api.github.com/repos/farmbot/farmbot_os/releases/tags/#{tag_name}"
      JSON.parse(URI.parse(real_url).open.read, symbolize_names: true)
    end

    def self.get_choice(choices)
      input = STDIN.gets.chomp
      if input.empty?
        puts "Input empty. Exiting."
        exit 0
      end
      index = input.to_i
      if index >= choices.length
        puts "Invalid choice. Exiting."
        exit 0
      end
      if index == 0 and input != "0"
        puts "Invalid choice. Exiting."
        exit 0
      end
      choice = choices.fetch(index)
      puts "\n#{choice}\n\n"
      choice
    end

    def self.select_version(choices)
      puts "\n=== AVAILABLE RELEASES ==="
      choices.each_with_index do |version, index|
        puts "#{index}) #{version}"
      end
      print "Select a release to publish: "
      get_choice(choices)
    end

    def self.get_release_list
      uri = "https://api.github.com/repos/farmbot/farmbot_os/releases"
      file = URI.parse(uri).open
      raw_json = file.read
      json = JSON.parse(raw_json, symbolize_names: true).pluck(:tag_name)
      json
    end

    def self.get_channel
      puts "\n=== AVAILABLE CHANNELS ==="
      Release::CHANNEL.each_with_index do |chan, inx|
        puts "#{inx}) #{chan}"
      end
      print "Select a channel to publish to: "
      get_choice(Release::CHANNEL)
    end

    def self.print_release(release)
      is_new = release.saved_change_to_attribute?(:id)
      tpl = is_new ? NEW_RELEASE_TEMPLATE : OLD_RELEASE_TEMPLATE
      params = release.as_json.symbolize_keys
      puts tpl % params
      release
    end

    def self.get_brief_release_info
      info = []
      Release.all.map do |r|
        if r.platform == "rpi"
          info.push("#{r.channel.ljust(8)} #{r.version.ljust(14)}" +
                    "#{r.created_at.to_s.slice(0, 10)}")
        end
      end
      info.join("\n")
    end

    def self.print_all_existing_releases
      puts ""
      Release.all.map do |r|
        puts "#{r.id.to_s.ljust(6)} #{r.channel.ljust(8)}" +
             "#{r.platform.ljust(6)} #{r.version.ljust(14)} #{r.created_at}"
      end
      puts ""
      puts get_brief_release_info
      puts ""
    end

    def self.device_version_list
      Device
        .where("last_saw_api > ?", 24.hours.ago)
        .pluck(:fbos_version)
        .compact
        .map{|x| x}
        .tally
        .sort_by{|(k, v)| v}
        .reverse
        .to_a
        .map{|v, c| "#{v.ljust(17)} #{c.to_s.rjust(5)}"}
        .join("\n")
    end

    def self.create_releases(metadata, channel)
      output = Releases::Parse.run!(metadata)
        .map { |params| Releases::Create.run!(params.merge(channel: channel)) }
        .map { |release| print_release(release) }
      if channel == "stable"
        # QA cycles are expected to be short.
        # Do not allow devices to stay on unstable channels
        # when a QA cycle ends.
        puts "=== Moving all devices to `stable`"
        FbosConfig
          .where
          .not(update_channel: "stable")
          .update_all(update_channel: "stable")
      end
      output
    end

    def self.prevent_disaster(version:, chan:)
      if version.include?("rc") && chan == Release::STABLE
        puts "Refusing to publish unstable release candidate to stable channel."
        exit 1
      end
    end

    def self.select_summary_type
      puts "\n=== SUMMARY OPTIONS ==="
      choices = ["none", "message", "link", "body", "versions"]
      choices.each_with_index do |version, index|
        puts "#{index}) #{version}"
      end
      print "Select a summary type (cumulative): "
      get_choice(choices)
    end

    def self.prepare_summary(server, metadata)
      title = "current releases: #{server}"
      tag_name = metadata.fetch(:tag_name)
      notification_text = title + " (new: #{tag_name})"
      puts "\n=== notification ===\n"
      puts notification_text
      puts "\n=== message ===\n"
      info = title
      info += "\n```#{get_brief_release_info}```"
      puts info
      puts "\n=== link ==="
      link = "\n\n<#{metadata.fetch(:html_url)}|#{tag_name}>"
      puts link
      puts "\n=== body ==="
      body = "\n#{metadata.fetch(:body)}"
      puts body
      puts "\n=== versions ==="
      versions = "\n\nVersions of devices active in the last 24 hours:"
      versions += "\n```#{self.device_version_list}```"
      puts versions
      [notification_text, info, link, body, versions]
    end

    def self.post_summary(metadata)
      webhook_url = ENV["RELEASE_WEBHOOK_URL"]
      if webhook_url
        server = Release.first.image_url.split("/")[3].split("-")[1]
        notification_text, info, link, body, versions = prepare_summary(server, metadata)
        summary_type = select_summary_type
        return if summary_type == "none"
        if ["link", "body", "versions"].include?(summary_type)
          info += link
        end
        if ["body", "versions"].include?(summary_type)
          info += body
        end
        if ["versions"].include?(summary_type)
          info += versions
        end
        payload = {
          "mrkdwn": true,
          "text": notification_text,
          "blocks": [
            {
              "type": "section",
              "text": {
                "type": "mrkdwn",
                "text": info,
              }
            }
          ],
        }.to_json
        Faraday.post(webhook_url,
                     payload,
                     "Content-Type" => "application/json")
      end
    end
  end

  desc "Send upgrade notification to devices that are online"
  task notify: :environment do
    Devices::UnattendedUpgrade.delay.run!()
  end

  desc "Publish the latest release found on farmbot/farmbot_os github org"
  task publish: :environment do
    ReleaseTask.print_all_existing_releases
    choices = ReleaseTask.get_release_list
    version = ReleaseTask.select_version(choices)
    chan = ReleaseTask.get_channel
    ReleaseTask.prevent_disaster(version: version, chan: chan)
    json = ReleaseTask.download_metadata(version)
    releases = ReleaseTask.create_releases(json, chan)
    # Clean out old releases for $CHANNEL
    Release
      .where(channel: chan)
      .where.not(id: releases.pluck(:id))
      .map do |release|
      puts "Destroying old release ##{release.id}"
      release.destroy!
    end
    ReleaseTask.print_all_existing_releases
    ReleaseTask.post_summary(json)
  end
end
