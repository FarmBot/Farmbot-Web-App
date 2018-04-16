# *Physical* information about a device attached to the tool mount. Not to be
# confused with Peripherals, which keep track of electronic data such as pin
# modes.
class Tool < ApplicationRecord
  belongs_to :device
  has_one    :tool_slot
  validates  :device, presence: true
  validates  :name,   uniqueness: { scope: :device }

  IN_USE = "Tool in use by the following sequences: %s"
end
