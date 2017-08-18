class WebcamFeed < ApplicationRecord
  belongs_to :device
  validates_presence_of :url
  validates_presence_of :device
end
