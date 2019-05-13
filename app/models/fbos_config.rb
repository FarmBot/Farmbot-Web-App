# An API backup of user options for Farmbot OS.
class FbosConfig < ApplicationRecord
  class MissingSerial < StandardError; end

  belongs_to :device
  after_save :maybe_sync_nerves, on: [:create, :update]

  FIRMWARE_HARDWARE = [
    NONE = nil,
    ARDUINO = "arduino",
    FARMDUINO = "farmduino",
    FARMDUINO_K14 = "farmduino_k14",
    EXPRESS_K10 = "express_k10",
  ]

  NERVES_FIELD = "update_channel"

  def push_changes_to_nerves_hub(serial_number, channel)
    NervesHub.update_channel(serial_number, channel)
  end

  def sync_nerves
    serial = device.serial_number
    unless serial
      # This feature can be removed in May '19
      # It is used to repair data damage on
      # production during the initial nerveshub
      # deployment.
      problem = "Device #{device.id} missing serial"
      NervesHub.report_problem({ problem: problem })
      return
    end
    self.delay.push_changes_to_nerves_hub(serial, update_channel)
  end

  def nerves_info_changed?
    the_changes.keys.include?(NERVES_FIELD)
  end

  def maybe_sync_nerves
    sync_nerves if nerves_info_changed?
  end
end
