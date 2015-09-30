module Plants
  class Create < Mutations::Command
    required do
      model :device, class: Device
      integer :x
      integer :y
    end

    def execute
      Plant.create!(inputs)
    end
  end
end
