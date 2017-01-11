require "open-uri"

class Image < ApplicationRecord
  belongs_to :device
  validates :device, presence: true

  has_attached_file :attachment,
    # default_url: "/images/:style/missing.png",
    styles: { x1280: "1280x1280>",
              x640:  "640x640>",
              x320:  "320x320>",
              x160:  "160x160>",
              x80:    "80x80>" },
    size: { in: 0..5.megabytes } # Worst case scenario for 1280x1280 BMP.
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
