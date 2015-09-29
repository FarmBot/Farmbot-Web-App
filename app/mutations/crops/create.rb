module Crops
  class Create < Mutations::Command
    required do
      model :device, class: Device
      integer :x
      integer :y
    end

    def execute
      Crop.create!(inputs)
    end
  end
end
