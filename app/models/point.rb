class Point < ApplicationRecord
  POINTER_KINDS = { "GenericPointer" => GenericPointer,
                    "ToolSlot"       => ToolSlot,
                    "Plant"          => Plant }
  SHARED_FIELDS = [:x, :y, :z, :radius, :name, :meta]
  belongs_to :device
  belongs_to :pointer, polymorphic: true, dependent: :destroy
  validates :pointer_type,
            inclusion: { in: POINTER_KINDS.keys,
                         message: "%{value} is not a valid pointer type" }
  validates :pointer, presence: true
  validates_presence_of :pointer
  validates_presence_of :device
  accepts_nested_attributes_for :pointer
end
