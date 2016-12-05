class Tool < ApplicationRecord
  belongs_to :tool_slot
  belongs_to :device
  validates  :device, presence: true
  validates :name, uniqueness: { scope: :device }
end
