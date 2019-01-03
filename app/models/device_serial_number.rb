class DeviceSerialNumber < ApplicationRecord
  belongs_to :device
  before_save :dont_save

  def dont_save
    raise "This table is deprecated. Stop using it."
  end
end
