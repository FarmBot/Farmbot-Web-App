class Point < ApplicationRecord
  POINTER_KINDS = { "GenericPointer" => GenericPointer,
                    "ToolSlot"       => ToolSlot,
                    "Plant"          => Plant }
  SHARED_FIELDS = [:x, :y, :z, :radius, :name, :device_id]
  belongs_to :device
  belongs_to :pointer, polymorphic: true, dependent: :destroy
  validates_presence_of :pointer
  validates_presence_of :device
  accepts_nested_attributes_for :pointer
end
