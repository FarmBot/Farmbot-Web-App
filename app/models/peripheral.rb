# Information about electronic devices attached to a bot's GPIO pins.
# This is used for reference and is not used to directly control the device.
# Examples: temperature probes, LEDs, etc.
class Peripheral < ActiveRecord::Base
  belongs_to :device
  validates :device, presence: true
  validates :pin, presence: true
  validates :pin, uniqueness: { scope: :device }
  validates :mode, inclusion: { in: Sequence::ALLOWED_PIN_MODES }
  validates :pin, numericality: { only_integer: true,
                                  greater_than_or_equal_to: 0,
                                  less_than_or_equal_to: 1000 }
  validates :label, presence: true
end
