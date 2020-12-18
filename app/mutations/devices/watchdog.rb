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
      @upper_limit ||= 16.hours.ago
    end

    def time_window
      @time_window ||= lower_limit..upper_limit
    end

    def affected_users
      @affected_users ||= User.where(device_id: devices.pluck(:id))
    end

    def eligible_devices
      @eligible_devices ||= Device.where("first_saw_api < ?", lower_limit)
    end

    def devices
      eligible_devices
        .where(last_saw_api: time_window)
        .where(last_ota_attempt_at: time_window)
    end
  end
end
