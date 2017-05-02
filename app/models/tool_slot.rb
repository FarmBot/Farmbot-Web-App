# A single slot in a larger tool rack. Lets the sequence builder know things
# like where to put a tool when not in use, where to grab the next tool from,
# etc.
class ToolSlot < ApplicationRecord
  belongs_to :tool
  validates_uniqueness_of :tool,
                          allow_blank: true,
                          allow_nil: true,
                          message: "already in use by another tool slot"
end
