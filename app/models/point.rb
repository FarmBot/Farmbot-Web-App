class Point < ApplicationRecord
  # Using real constants instead of strings results in circular dep. errors.
  POINTER_KINDS = ["GenericPointer", "Plant", "ToolSlot"]

  belongs_to :device
  validates_presence_of :device

  def pointer_id
    raise "deprecated"
  end
end
