class Point < ApplicationRecord
  include Discard::Model

  # Using real constants instead of strings results in circular dep. errors.
  POINTER_KINDS           = ["GenericPointer", "Plant", "ToolSlot"]
  self.inheritance_column = 'pointer_type'

  belongs_to :device
  validates_presence_of :device

  after_find    :maybe_migrate
  after_discard :maybe_broadcast

  def should_migrate?
    self.id && !self.migrated_at && (self.pointer_id != 0)
  end

  def maybe_migrate
    do_migrate if should_migrate?
  end

  def do_migrate
    # ABSTRACT METHOD.
  end

  # Overridable
  def name_used_when_syncing
    "Point"
  end
end
