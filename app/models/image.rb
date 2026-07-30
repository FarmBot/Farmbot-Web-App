require "open-uri"
require "marcel"
# A set of image URLs (thumbs) + Associated meta data.
class Image < ApplicationRecord
  class DirectUploadTooLarge < StandardError; end
  class InvalidDirectUploadImage < StandardError; end

  belongs_to :device
  validates :device, presence: true
  serialize :meta, coder: YAML

  # http://stackoverflow.com/a/5127684/1064917
  after_initialize :set_defaults

  def set_defaults
    self.meta ||= {}
  end

  PLACEHOLDER = "/placeholder_farmbot.jpg?text=Processing..."
  PROTO = ENV["FORCE_SSL"] ? "https:" : "http:"
  DEFAULT_URL = "#{PROTO}#{$API_URL}#{PLACEHOLDER}"
  RMAGICK_STYLES = {
    x1280: "1280x1280>",
    x640: "640x640>",
    x320: "320x320>",
    x160: "160x160>",
    x80: "80x80>",
  }
  MAX_IMAGE_SIZE = 7.megabytes
  DIRECT_UPLOAD_TOKEN_TTL = 1.hour
  CONFIG = { default_url: DEFAULT_URL,
             styles: RMAGICK_STYLES,
             size: { in: 0..MAX_IMAGE_SIZE } }

  CONTENT_TYPES = ["image/jpg", "image/jpeg", "image/png", "image/gif"]
  GCS_ACCESS_KEY_ID = ENV.fetch("GCS_KEY") { puts "Not using Google Cloud" }
  GCS_SECRET_ACCESS_KEY = ENV.fetch("GCS_ID") { puts "Not using Google Cloud" }
  # Worst case scenario for 1280x1280 BMP.

  has_one_attached :attachment

  def bucket
    ENV["GCS_BUCKET"]
  end

  def image_url_tpl
    root_path = bucket ? "https://#{bucket}.storage.googleapis.com" : "/system"
    root_path + "/images/attachments/%{chunks}/%{size}/%{filename}?%{timestamp}"
  end

  def set_attachment_by_url(url)
    io = URI.parse(url).open
    fname = "image_#{self.id}"
    params = { io: io, filename: fname }
    attachment.attach(**params)
    self.attachment_processed_at = Time.now
    self
  end

  # Scenario:
  #   User clicks "take photo" and "delete" on Image#123 very quickly.
  # Problem:
  #   Now there's a Delayed::Job pointing to (nonexistent) Image#123,
  #   causing runtime errors in the work queue.
  # Solution:
  #   Don't retry failed deletions. Users can always click the "delete"
  #   button again if need be.
  def self.maybe_destroy(id)
    image = find_by(id: id)
    image.destroy! if image
  end

  def legacy_image?
    !!self.attachment_file_size # This is a now-unused legacy field.
  end

  def regular_image?
    attachment && attachment.attached?
  end

  def regular_url
    if bucket
      "https://storage.googleapis.com/#{bucket}/#{attachment.key}"
    else
      Rails
        .application
        .routes
        .url_helpers
        .rails_blob_url(attachment)
    end
  end

  def legacy_url(size)
    url = format(
      image_url_tpl,
      chunks: id.to_s.rjust(9, "0").scan(/.{3}/).join("/"),
      filename: attachment_file_name,
      size: size,
      timestamp: attachment_updated_at.to_i,
    )
    return ENV["GCS_KEY"].present? ? url.gsub("http://", "https://") : url
  end

  def attachment_url(size = "x640")
    # Detect legacy attachments by way of
    # superseded PaperClip-related field.
    # If it has an `attachment_file_size`,
    # it was made with paperclip.
    return regular_url if regular_image?

    return legacy_url(size) if legacy_image?

    return DEFAULT_URL
  end

  def self.self_hosted_image_upload(key:, file:)
    raise "No." unless Api::ImagesController.store_locally?

    name = key.split("/").last
    src = file.tempfile.path
    raise DirectUploadTooLarge if File.size(src) > MAX_IMAGE_SIZE
    detected_type = Marcel::MimeType.for(Pathname.new(src))
    raise InvalidDirectUploadImage unless detected_type == "image/jpeg"

    FileUtils.mkdir_p(direct_upload_directory)
    dest = direct_upload_path(name)
    FileUtils.mv(src, dest)
  end

  def self.direct_upload_path(name)
    direct_upload_directory.join(File.basename(name))
  end

  def self.direct_upload_token(key)
    direct_upload_verifier.generate(key, expires_in: DIRECT_UPLOAD_TOKEN_TTL)
  end

  def self.valid_direct_upload_token?(key:, token:)
    token.present? && direct_upload_verifier.verified(token) == key
  end

  def self.direct_upload_verifier
    Rails.application.message_verifier("direct_upload")
  end
  private_class_method :direct_upload_verifier

  def self.direct_upload_directory
    Rails.root.join("tmp", "direct_upload")
  end
  private_class_method :direct_upload_directory
end
