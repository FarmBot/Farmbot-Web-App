require "open-uri"
require "google/cloud/storage"

class Release < ApplicationRecord
  CHANNEL = [BETA = "beta", STABLE = "stable"]
  GITHUB_URL = "https://api.github.com/repos/farmbot/farmbot_os/releases/latest"
  PLATFORMS = [GENESIS = "rpi3", EXPRESS = "rpi"]
  VERSION_REGEX = /v\d*\.\d*\.\d*(\-rc\d*)?/
  before_update :readonly!

  def self.transload(url, gcs = Google::Cloud::Storage.new)
    file_name = url.split("/").last
    tempdir = "#{Rails.root.join("tmp").to_s}/#{file_name}"
    download = URI.open(url)
    IO.copy_stream(download, tempdir)
    bucket = gcs.bucket(ENV.fetch("GCS_BUCKET"))
    file = bucket.upload_file tempdir, "releases/#{file_name}"
    return file.url
  end
end
