class Point < ApplicationRecord
  belongs_to :device
  belongs_to :pointer, polymorphic: true
end
