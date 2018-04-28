module SavedGardens
  class Create < Mutations::Command
    required do
      string :name
      model  :device, class: Device
    end

    optional do
    end

    def execute
      SavedGarden.create!(inputs)
    end
  end
end
