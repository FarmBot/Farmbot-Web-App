class WebcamFeed < ApplicationRecord
  DEFAULT_FEED_URL = "/placeholder_farmbot.jpg"
  belongs_to :device
  validates :url, presence: true
  validates :device, presence: true
end
