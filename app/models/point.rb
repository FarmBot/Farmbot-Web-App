class Point < ApplicationRecord
  # Using real constants instead of strings results in circular dep. errors.
  POINTER_KINDS = ["GenericPointer", "Plant", "ToolSlot"]

  belongs_to :device
  validates_presence_of :device

  puts "IMPORTANT: Remove this line before merging!"
  self.ignored_columns = %w(pointer_id pointer_type)
end
