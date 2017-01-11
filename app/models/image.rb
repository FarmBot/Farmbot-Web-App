class Image < ApplicationRecord
  has_attached_file :attachment,
    # default_url: "/images/:style/missing.png",
    styles: { x1280: "1280x1280>",
              x640:  "640x640>",
              x320:  "320x320>",
              x160:  "160x160>",
              x80:    "80x80>" },
    size: { in: 0..5.megabytes } # Worst case scenario for 1280x1280 BMP.
  validates_attachment_content_type :attachment, content_type: /\Aimage\/.*\z/
  validates_attachment_file_name :attachment, matches: [/png\z/,
                                                        /jpe?g\z/,
                                                        /bmp\z/]
end
