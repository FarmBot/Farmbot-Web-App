class Point < ApplicationRecord
  POINTER_KINDS = [
    "GenericPointer",
    "ToolSlot",
    "Plant"
  ]

  SHARED_FIELDS = [:x, :y, :z, :radius, :name, :meta]
  INVALID_TYPE  = "%{value} is not a valid pointer type"

  belongs_to :device
  validates :pointer_type,
    inclusion: { in: POINTER_KINDS, message: INVALID_TYPE }
  validates_presence_of :device

  def pointer_id
    raise "deprecated"
  end

  def self.constantize_pointer(name)
    ({
      "GenericPointer" => GenericPointer,
      "ToolSlot"       => ToolSlot,
      "Plant"          => Plant
    })[name] || "none"
  end
end
