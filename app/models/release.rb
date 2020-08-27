require "open-uri"
require "google/cloud/storage"

class Release < ApplicationRecord
  PLATFORMS = [GENESIS = "rpi3", EXPRESS = "rpi"]
  CHANNEL = [BETA = "beta", STABLE = "stable"]
  VERSION_REGEX = /v\d*\.\d*\.\d*(\-rc\d*)?/
  GITHUB_URL = "https://api.github.com/repos/farmbot/farmbot_os/releases/latest"
  before_update :readonly!

  def self.transload(url)
    file_name = url.split("/").last
    tempdir = "#{Rails.root.join("tmp").to_s}/#{file_name}"
    download = URI.open(url)
    IO.copy_stream(download, tempdir)
    bucket = Google::Cloud::Storage.new.bucket(ENV.fetch("GCS_BUCKET"))
    file = bucket.upload_file tempdir, "releases/#{file_name}"
    return file.url
  end
end
