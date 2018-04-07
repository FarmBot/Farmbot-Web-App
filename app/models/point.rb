class Point < ApplicationRecord
  POINTER_KINDS = [ "GenericPointer", "ToolSlot", "Plant" ]

  belongs_to :device
  validates_presence_of :device

  def pointer_id
    raise "deprecated"
  end
end
