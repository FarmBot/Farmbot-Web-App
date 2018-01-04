module Tools
  class Create < Mutations::Command
    required do
      string  :name
      model   :device, class: Device
    end
    optional { integer :pullout_direction, in: Tool::PULLOUT_DIRECTIONS }

    def execute
      Tool.create!(inputs)
    end
  end
end
