# A record of installation of a Farmware.
# Useful for restoring a device after a re-flash.
class FarmwareInstallation < ApplicationRecord
  belongs_to :device
  validates  :url, url: true
end
