module Sensors
  class Create < Mutations::Command
    required do
      model   :device, class: Device
      integer :pin
      string  :label
      integer :mode, in: CeleryScriptSettingsBag::ALLOWED_PIN_MODES
    end

    def execute
      Sensor.create!(inputs)
    end
  end
end
