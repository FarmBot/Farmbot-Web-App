module SavedGardens
  class SnapShot < Mutations::Command
    required do
      string :name
      model  :device, class: Device
    end

    def execute
      SavedGarden.transaction do
        binding.pry
        create_templates_from_plants
        SavedGarden.create!(inputs)
      end
    end

    def create_templates_from_plants
      raise "NOT IMPLEMENTED - RC"
    end
  end
end
