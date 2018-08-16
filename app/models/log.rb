# A device will emit logs when events occur on the Raspberry Pi. Logs are then
# read by clients. Logs are only created by devices.
class Log < ApplicationRecord
  include LogDeliveryStuff
  # We use log.type to store the log's type.
  # Rails wants to use that name for single table inheritence, which we don't
  # need for this table.
  # Setting the `inheritence_column` to "none" alleviate
  self.inheritance_column = "none"
  # Used by the frontend to pull most recent records. We don't currently support
  # pagination, but could later on.
  PAGE_SIZE = 25

  # Why "EMAIL_ISH"? Because `fatal_email` is LIKE '%email%', but it's probably
  # not the one you want.
  IS_EMAIL_ISH   = "channels LIKE '%email%'"
  IS_FATAL_EMAIL = "channels LIKE '%fatal_email%'"
  DISCARD        = ["fun", "debug", nil]
  TYPES          = CeleryScriptSettingsBag::ALLOWED_MESSAGE_TYPES
  # The means by which the message will be sent. Ex: frontend toast notification
  serialize  :channels
  belongs_to :device

  validates :device, presence: true
  validates :type,   presence: true
  serialize :meta
  validates :meta, presence: true
  # http://stackoverflow.com/a/5127684/1064917
  before_validation :set_defaults

  def set_defaults
    self.channels ||= []
  end

  # Legacy shims ===============================================================
  #  TODO: Remove these once FBOS stops using the `meta` field (FBOS < v6.4.0).
  def meta
    {
      type:          self.type,
      major_version: self.major_version,
      minor_version: self.minor_version,
      verbosity:     self.verbosity,
      x:             self.x,
      y:             self.y,
      z:             self.z,
    }
  end

  def meta=(hash)
    hash.map      { |(key, value)| self.send("#{key}=", value)  }
    self.meta
  end
  # End Legacy shims ===========================================================

  def broadcast? # Logs get their own special channel. Don't echo twice!
    false
  end
end
