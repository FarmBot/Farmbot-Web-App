module Sensors
  class Update < Mutations::Command
    required { model :sensor, class: Sensor }

    optional do
      integer :pin
      string  :label
      integer :mode, in: CeleryScriptSettingsBag::ALLOWED_PIN_MODES
    end

    def execute
      sensor.update_attributes!(inputs.except(:sensor))
      sensor
    end
  end
end
