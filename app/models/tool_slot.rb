class ToolSlot < ApplicationRecord
  has_many :tools
  belongs_to :tool_bay
end
