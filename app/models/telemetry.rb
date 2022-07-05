# A device will emit telemetry when events and metric reports occur on the Raspberry Pi.
# Telemetry are then read by clients. Telemetry are only created by devices.
class Telemetry < ApplicationRecord
  belongs_to :device

  validates :device, presence: true

end
