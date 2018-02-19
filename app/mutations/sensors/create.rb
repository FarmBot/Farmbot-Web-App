module Sensors
  class Create < Mutations::Command
    MODES    = CeleryScriptSettingsBag::ALLOWED_PIN_MODES
    BAD_MODE = CeleryScriptSettingsBag::BAD_ALLOWED_PIN_MODES

    required do
      model   :device, class: Device
      integer :pin
      string  :label
      integer :mode
    end

    def validate
      if !MODES.include?(mode)
        msg = BAD_MODE % [mode.to_s, MODES]
        add_error :mode, :not_allowed, msg
      end
    end

    def execute
      Sensor.create!(inputs)
    end
  end
end
