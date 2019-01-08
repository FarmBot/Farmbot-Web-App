# An API backup of user options for Farmbot OS.
class FbosConfig < ApplicationRecord
  class MissingSerial < StandardError; end

  belongs_to :device
  after_save :maybe_sync_nerves, on: [:create, :update]

  NERVES_FIELD = "update_channel"

  def push_changes_to_nerves_hub(serial_number, channel)
    NervesHub.update_channel(serial_number, channel)
  end

  def sync_nerves
    serial = device.serial_number
    return unless serial
    self.delay.push_changes_to_nerves_hub(serial, update_channel)
  end

  def nerves_info_changed?
    the_changes.keys.include?(NERVES_FIELD)
  end

  def maybe_sync_nerves
    sync_nerves if nerves_info_changed?
  end
end
