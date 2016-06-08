module Plants
  class Create < Mutations::Command
    required do
      model :device, class: Device
      float :x
      float :y
    end

    def execute
      Plant.create!(inputs)
    end
  end
end
