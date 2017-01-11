# Farmbot Device models all data related to an actual FarmBot in the real world.
class Device < ActiveRecord::Base
  DEFAULT_MAX_LOGS = 50
  has_many  :users
  has_many  :schedules,     dependent: :destroy
  has_many  :logs,          dependent: :destroy
  has_many  :sequences,     dependent: :destroy
  has_many  :regimens,      dependent: :destroy
  has_many  :plants,        dependent: :destroy
  has_many  :peripherals,   dependent: :destroy
  has_many  :tool_bays,     dependent: :destroy
  has_many  :tools,         dependent: :destroy
  has_many  :images,        dependent: :destroy
  has_one   :planting_area, dependent: :destroy
  validates :name,          uniqueness: true

  # Prevent the database from filling up with logs by deleting all logs after
  # the first X records. Increasing device.max_log_count gives the user
  # increased log storage.
  def limit_log_length
    these = logs.last(max_log_count || DEFAULT_MAX_LOGS).pluck(:id)
    logs.where.not(id: these).destroy_all
  end
end
