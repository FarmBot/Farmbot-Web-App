class Log < ActiveRecord::Base
  TYPES = ["success", "busy", "warn", "error", "info", "fun"]

  serialize  :meta
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