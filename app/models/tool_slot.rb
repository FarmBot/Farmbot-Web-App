# A single slot in a larger tool rack. Lets the sequence builder know things
# like where to put a tool when not in use, where to grab the next tool from,
# etc.
class ToolSlot < ApplicationRecord
  belongs_to :tool
  belongs_to :point
  delegate :x, to: :point
  delegate :y, to: :point
  delegate :z, to: :point
  delegate :radius, to: :point
  validates_uniqueness_of :tool,
                          allow_blank: true,
                          allow_nil: true,
                          message: "already in use by another tool slot"
end
