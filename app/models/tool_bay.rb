# A rack for placing tools, usually mounted on the side of a track. This
# information is important for physical operations and tool placement.
class ToolBay < ApplicationRecord
  belongs_to :device
  has_many :tool_slots, dependent: :destroy
end
