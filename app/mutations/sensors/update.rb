module Sensors
  class Update < Mutations::Command
    required { model :sensor, class: Sensor }

    optional do
      integer :pin
      string :label
      integer :mode, in: CeleryScriptSettingsBag::ALLOWED_PIN_MODES
      string :type, in: Sensor::TYPES
    end

    def execute
      sensor.update!(inputs.except(:sensor))
      sensor
    end
  end
end
