module EmailNotifications
  class Create < Mutations::Command
    required do
      model :device, class: Device
    end

    def validate
      check_rate_limit
    end

    def execute
      raise "NOPE!"
    end

private

    def check_rate_limit
      raise "NOPE!"
    end
  end
end
