# A device will emit logs when events occur on the Raspberry Pi. Logs are then
# read by clients. Logs are only created by devices.
class Log < ApplicationRecord
  include LogDeliveryStuff
  # We use log.type to store the log's type.
  # Rails wants to use that name for single table inheritance, which we don't
  # need for this table.
  # Setting the `inheritance_column` to "none" alleviate
  self.inheritance_column = "none"
  # Used by the frontend to pull most recent records. We don't currently support
  # pagination, but could later on.
  PAGE_SIZE = 25

  # Why "EMAIL_ISH"? Because `fatal_email` is LIKE '%email%', but it's probably
  # not the one you want.
  IS_EMAIL_ISH = "channels LIKE '%email%'"
  IS_FATAL_EMAIL = "channels LIKE '%fatal_email%'"
  DISCARD = ["fun", "debug", nil]
  TYPES = CeleryScriptSettingsBag::ALLOWED_MESSAGE_TYPES
  # The means by which the message will be sent. Ex: frontend toast notification
  serialize :channels
  belongs_to :device

  validates :device, presence: true
  validates :type, presence: true
  # http://stackoverflow.com/a/5127684/1064917
  before_validation :set_defaults

  def set_defaults
    self.channels ||= []
  end

  def broadcast? # Logs get their own special channel. Don't echo twice!
    false
  end
end
