module SensorReadings
  class Create < Mutations::Command
    required do
      model   :device, class: Device
      float   :x
      float   :y
      float   :z
      integer :value
      integer :pin
    end

    def execute
      SensorReading.create!(inputs)
    end
  end
end
