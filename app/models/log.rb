# A device will emit logs when events occur on the Raspberry Pi. Logs are then
# read by clients. Logs are only created by devices.
class Log < ActiveRecord::Base
  # Used by the frontend to pull most recent records. We don't currently support
  # pagination, but could later on.
  PAGE_SIZE = 25
  # self.meta[:type] is used by the bot and the frontend as a sort of
  TYPES     = %w(success busy warn error info fun)
  serialize  :meta
  # The means by which the message will be sent. Ex: frontend toast notification
  serialize  :channels
  belongs_to :device

  validates :device, presence: true
  # http://stackoverflow.com/a/5127684/1064917
  before_validation :set_defaults

  def set_defaults
    self.channels ||= []
    self.meta ||= {}
    self.meta[:type] ||= "info"
  end
end