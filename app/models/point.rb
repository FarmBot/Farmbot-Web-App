class Point < ApplicationRecord
  SHARED_FIELDS = [:x, :y, :radius, :name, :device_id ]
  belongs_to :device
  belongs_to :pointer, polymorphic: true
  validates_presence_of :pointer
end
