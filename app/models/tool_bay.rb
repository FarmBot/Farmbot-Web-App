class ToolBay < ApplicationRecord
  belongs_to :device
  has_many :tool_slots, dependent: :destroy
end
