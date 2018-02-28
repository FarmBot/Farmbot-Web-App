class PinBinding < ApplicationRecord
  belongs_to :device
  belongs_to :sequence
end
