module Devices
  class Watchdog < Mutations::Command
    def execute
      affected_users
    end

    private

    def lower_limit
      @lower_limit ||= 2.days.ago
    end

    def upper_limit
      @upper_limit ||= 8.hours.ago
    end

    def time_window
      @time_window ||= lower_limit..upper_limit
    end

    def affected_users
      @affected_users ||= User.where(device_id: devices.pluck(:id))
    end

    def devices
      Device
        .where("last_watchdog < ?", lower_limit)
        .where(last_saw_api: time_window)
    end
  end
end
