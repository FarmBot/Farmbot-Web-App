class FarmwareInstallation < ApplicationRecord
  belongs_to :device
  validates  :url, url: true
end
