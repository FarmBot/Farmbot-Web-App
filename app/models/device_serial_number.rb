class DeviceSerialNumber < ApplicationRecord
  belongs_to :device
  # DO NOT USE THIS TABLE. IT IS DEPRECATED. DESTROY FEB 2019.
end
