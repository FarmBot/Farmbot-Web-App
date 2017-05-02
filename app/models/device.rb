# Farmbot Device models all data related to an actual FarmBot in the real world.
class Device < ActiveRecord::Base
  DEFAULT_MAX_LOGS   = 50
  DEFAULT_MAX_IMAGES = 100
  TIMEZONES          = ActiveSupport::TimeZone.all.map(&:to_s)

  has_many  :users
  has_many  :farm_events,   dependent: :destroy
  has_many  :points,        dependent: :destroy
  has_many  :logs,          dependent: :destroy
  has_many  :sequences,     dependent: :destroy
  has_many  :regimens,      dependent: :destroy
  has_many  :plants,        dependent: :destroy
  has_many  :peripherals,   dependent: :destroy
  has_many  :tools,         dependent: :destroy
  has_many  :images,        dependent: :destroy
  validates :name,          uniqueness: true

  # Give the user back the amount of logs they are allowed to view.
  def limited_log_list
    logs.all.last(max_log_count || DEFAULT_MAX_LOGS)
  end
end
