require "open-uri"

class Image < ApplicationRecord
  belongs_to :device
  validates  :device, presence: true
  serialize  :meta

  # http://stackoverflow.com/a/5127684/1064917
  after_initialize :set_defaults

  def set_defaults
    self.meta ||= {}
  end

  CONFIG = {
    default_url: "//placehold.it/640?text=Processing...",
    styles: { x1280: "1280x1280>",
              x640:  "640x640>",
              x320:  "320x320>",
              x160:  "160x160>",
              x80:   "80x80>" },
    size: { in: 0..7.megabytes } # Worst case scenario for 1280x1280 BMP.
  }

  bucket = ENV["GCS_BUCKET"]
  CONFIG.merge!({
    storage:         :fog,
    fog_host:        "http://#{bucket}.storage.googleapis.com",
    fog_directory:   bucket,
    fog_credentials: { provider:                         "Google",
                        google_storage_access_key_id:     ENV.fetch("GCS_KEY"),
                        google_storage_secret_access_key: ENV.fetch("GCS_ID")}
  }) if bucket

  has_attached_file :attachment, CONFIG

  validates_attachment_content_type :attachment,
    content_type: ["image/jpg", "image/jpeg", "image/png", "image/gif"]

  def set_attachment_by_url(url)
    # File
    # URI::HTTPS
    self.attachment = open(url)
    self.attachment_processed_at = Time.now
    self
  end
end
