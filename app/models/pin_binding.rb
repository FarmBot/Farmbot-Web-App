class PinBinding < ApplicationRecord
  belongs_to :device
  belongs_to :sequence
  enum special_action: { dump_info:        "dump_info",
                         emergency_lock:   "emergency_lock",
                         emergency_unlock: "emergency_unlock",
                         power_off:        "power_off",
                         read_status:      "read_status",
                         reboot:           "reboot",
                         sync:             "sync",
                         take_photo:       "take_photo" }
  def fancy_name
    "pin #{pin_num}"
  end
end
