class WebcamFeed < ApplicationRecord
  DEFAULT_FEED_URL = "/placeholder_farmbot.jpg"
  belongs_to :device
  validates_presence_of :url
  validates_presence_of :device
end
