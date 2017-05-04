class Point < ApplicationRecord
  SHARED_FIELDS = [:x, :y, :z, :radius, :name, :device_id]
  belongs_to :device
  belongs_to :pointer, polymorphic: true
  validates_presence_of :pointer
  accepts_nested_attributes_for :pointer
end
