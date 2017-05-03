class Point < ApplicationRecord
  belongs_to :device
  belongs_to :pointer, polymorphic: true
  validates_presence_of :pointer
end
