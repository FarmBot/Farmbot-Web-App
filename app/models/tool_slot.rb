class ToolSlot < ApplicationRecord
  belongs_to :tool
  belongs_to :tool_bay
end
