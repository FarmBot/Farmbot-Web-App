class Point < ApplicationRecord
  include Discard::Model
  MAX_AXIS_SIZE = 50_000 # No one has an axis value > 21k right now - RC
  # Using real constants instead of strings results in circular dep. errors.
  POINTER_KINDS           = ["GenericPointer", "Plant", "ToolSlot"]
  self.inheritance_column = "pointer_type"

  belongs_to :device
  validates_presence_of :device

  after_find    :maybe_migrate
  after_discard :maybe_broadcast

  [:x, :y, :z].map do |axis|
    validates_numericality_of axis, less_than: MAX_AXIS_SIZE
  end

  def should_migrate?
    self.id && !self.migrated_at && (self.pointer_id != 0) && !is_infinite?
  end

  def is_infinite? # Values of `infinity` will crash the migration process.
    [x,y,z].map{ |x| (x / 0.0) }.map(&:infinite?).compact.count == 0
  end

  def maybe_migrate
    do_migrate if should_migrate?
  end

  def do_migrate
    # ABSTRACT METHOD.
  end

  def name_used_when_syncing
    "Point"
  end
end
