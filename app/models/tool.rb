# *Physical* information about a device attached to the tool mount. Not to be
# confused with Peripherals, which keep track of electronic data such as pin
# modes.
class Tool < ApplicationRecord
  belongs_to :device
  has_one    :tool_slot
  validates  :device, presence: true
  validates  :name, uniqueness: { scope: :device }
  has_many  :sequence_dependencies, dependent: :destroy, as: :dependency

  def slot
    tool_slot # I kept forgetting. It's just an alias for when I forget.
  end
end
