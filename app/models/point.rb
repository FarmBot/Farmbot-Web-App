class Point < ApplicationRecord
  include Discard::Model
  MAX_AXIS_SIZE = 50_000 # No one has an
                         # axis value > 21k right now - RC
  # Using real constants instead of strings results
  # in circular dep. errors.
  POINTER_KINDS = ["GenericPointer", "Plant", "ToolSlot"]
  self.inheritance_column = "pointer_type"

  belongs_to :device
  validates_presence_of :device

  after_discard :maybe_broadcast

  [:x, :y, :z].map do |axis|
    validates_numericality_of axis, less_than: MAX_AXIS_SIZE
  end

  def name_used_when_syncing
    "Point"
  end

  def fancy_name
    n = InUsePoint::FANCY_NAMES[pointer_type] ||
        InUsePoint::DEFAULT_NAME
    "#{n} at (#{x}, #{y}, #{z})"
  end
end
