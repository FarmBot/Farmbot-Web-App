class ToolSlot < ApplicationRecord
  belongs_to :tool_bay
  has_many :tools
end
