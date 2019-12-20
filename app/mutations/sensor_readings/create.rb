module SensorReadings
  class Create < Mutations::Command
    required do
      model   :device, class: Device
      float   :x, nils: true, empty_is_nil: true
      float   :y, nils: true, empty_is_nil: true
      float   :z, nils: true, empty_is_nil: true
      integer :value
      integer :pin
    end

    optional do
      time :read_at
      integer :mode,
        in:      CeleryScriptSettingsBag::ALLOWED_PIN_MODES,
        default: CeleryScriptSettingsBag::DIGITAL
    end

    def execute
      SensorReading.create!(inputs.merge(read_at: read_at || Time.now))
    end
  end
end
