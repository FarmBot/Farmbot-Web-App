class Point < ApplicationRecord
  # Using real constants instead of strings results in circular dep. errors.
  POINTER_KINDS           = ["GenericPointer", "Plant", "ToolSlot"]
  self.inheritance_column = 'pointer_type'

  belongs_to :device
  validates_presence_of :device
end
