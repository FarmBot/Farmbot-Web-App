# THIS SHOULD NOT EXIST.
class ToolBay < ApplicationRecord
  belongs_to :device
  has_many :tool_slots
end
