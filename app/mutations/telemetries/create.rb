module Telemetries
  class Create < Mutations::Command
    required do
      # See note in Logs::create
      duck :device, methods: [:id, :is_device]
      string :target
    end

    optional do
      integer :soc_temp
      string :throttled
      integer :wifi_level_percent
      integer :uptime
      integer :memory_usage
      integer :disk_usage
      integer :cpu_usage
      string :fbos_version
      string :firmware_hardware
    end

    def validate
      @telemetry = Telemetry.new(clean_inputs)
      @telemetry.validate!
    end

    def execute
      @telemetry.save!
      @telemetry
    end

    private

    def clean_inputs
      @clean_inputs ||= inputs
        .except(:device)
        .merge(device_id: device.id)
    end
  end
end
