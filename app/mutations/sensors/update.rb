module Sensors
  class Update < Mutations::Command
    required do
      model :peripheral, class: Sensor
      model :device,     class: Device
    end

    optional do
      integer :pin
      string  :label
      integer :mode, in: CeleryScriptSettingsBag::ALLOWED_PIN_MODES
    end

    def execute
      peripheral.update_attributes!(inputs.except(:peripheral, :device))
      peripheral
    end
  end
end
