# An API backup of user options for Farmbot OS.
class FbosConfig < ApplicationRecord
  belongs_to :device
  after_save :maybe_sync_nerves, on: [:create, :update]

  NERVES_FIELD = "update_channel"

  def nerves_info_changed?
    the_changes.keys.include?(NERVES_FIELD)
  end

  def sync_nerves
    binding.pry
  end

  def maybe_sync_nerves
    sync_nerves if nerves_info_changed?
  end
end
