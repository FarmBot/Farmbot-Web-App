require "open-uri"
# A set of image URLs (thumbs) + Associated meta data.
class Image < ApplicationRecord
  belongs_to :device
  validates  :device, presence: true
  serialize  :meta

  # http://stackoverflow.com/a/5127684/1064917
  after_initialize :set_defaults

  def set_defaults
    self.meta ||= {}
  end

  PROTO       = ENV["FORCE_SSL"] ? "https:" : "http:"
  PLACEHOLDER = "/app-resources/img/placeholder.png\?text=Processing..."
  CONFIG = {
    default_url: "#{PROTO}#{$API_URL}#{PLACEHOLDER}",
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

  # Scenario:
  #   User clicks "take photo" and "delete" on Image#123 very quickly.
  # Problem:
  #   Now there's a Delayed::Job pointing to (nonexistent) Image#123,
  #   causing runtime errrors in the work queue.
  # Solution:
  #   Don't retry failed deletions. Users can always click the "delete"
  #   button again if need be.
  def self.maybe_destroy(id)
    image = find_by(id: id)
    image.destroy! if image
  end
end
