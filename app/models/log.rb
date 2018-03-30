# A device will emit logs when events occur on the Raspberry Pi. Logs are then
# read by clients. Logs are only created by devices.
class Log < ApplicationRecord
  # Used by the frontend to pull most recent records. We don't currently support
  # pagination, but could later on.
  PAGE_SIZE = 25

  DISCARD = ["fun", "debug"]
  # self.meta[:type] is used by the bot and the frontend as a sort of
  TYPES     = CeleryScriptSettingsBag::ALLOWED_MESSAGE_TYPES
  # The means by which the message will be sent. Ex: frontend toast notification
  serialize  :channels
  belongs_to :device

  validates :device, presence: true
  serialize  :meta
  validates :meta, presence: true
  # http://stackoverflow.com/a/5127684/1064917
  before_validation :set_defaults
  has_one :log_dispatch, dependent: :destroy

  def set_defaults
    self.channels ||= []
    self.meta ||= {}
    self.meta[:type] ||= "info"
  end

  def meta=(*)
    puts "This column is read-only now."
  end

  def broadcast? # Logs get their own special channel. Don't echo twice!
    false
  end
end
