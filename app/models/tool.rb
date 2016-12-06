class Tool < ApplicationRecord
  belongs_to :device
  has_one    :tool_slot
  validates  :device, presence: true
  validates  :name, uniqueness: { scope: :device }
end
