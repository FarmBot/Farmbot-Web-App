class Point < ApplicationRecord
  ALL           = [GenericPointer, Plant, ToolSlot]
  POINTER_KINDS = ALL.map(&:name)

  belongs_to :device
  validates_presence_of :device

  def pointer_id
    raise "deprecated"
  end
end
