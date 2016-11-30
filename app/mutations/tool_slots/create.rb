module ToolSlots
  class Create < Mutations::Command
    required do
      model :device, class: Device
      string :name
      integer :x
      integer :y
      integer :z
    end

    def execute
      ToolSlot.create!(inputs)
    end
  end
end
