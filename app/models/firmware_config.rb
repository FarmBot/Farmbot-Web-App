# Arduino config, backed up on the API for safety.
class FirmwareConfig < ApplicationRecord
  belongs_to :device
end
