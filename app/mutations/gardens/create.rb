module Gardens
  class Create < Mutations::Command
    required do
      string :name
      model  :device, class: Device
    end

    optional do
    end

    def execute
      Garden.create!(inputs)
    end
  end
end
