require "open-uri"

class Image < ApplicationRecord
  belongs_to :device
  validates  :device, presence: true
  serialize  :meta
  # TODO: EASY: Why can't I set this meta fields default value to '{}'?
  #             Tests are failing when I do. PRs appreciated.
  # validates  :meta, presence: true
  # http://stackoverflow.com/a/5127684/1064917
  after_initialize :set_defaults

  def set_defaults
    self.meta ||= {}
  end

  has_attached_file :attachment,
    storage: :fog,
    fog_directory: ENV["GCS_BUCKET"],
    fog_credentials: { provider:                         "Google",
                       google_storage_access_key_id:     ENV["GCS_KEY"],
                       google_storage_secret_access_key: ENV["GCS_ID"]},
    default_url: "http://placehold.it/640?text=Processing...",
    styles: { x1280: "1280x1280>",
              x640:  "640x640>",
              x320:  "320x320>",
              x160:  "160x160>",
              x80:    "80x80>" },
    size: { in: 0..7.megabytes } # Worst case scenario for 1280x1280 BMP.
    validates_attachment_content_type :attachment,
      content_type: ["image/jpg",
                     "image/jpeg",
                     "image/png",
                     "image/gif"]

  def set_attachment_by_url(url)
    # Image.new.set_attachment_by_url("http://i.imgur.com/OhLresv.png").save!
    self.attachment = open(url)
    self.attachment_processed_at = Time.now
    self
  end
end
