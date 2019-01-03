class DeviceSerialNumber < ApplicationRecord
  belongs_to :device
  validates_uniqueness_of :serial_number
end
