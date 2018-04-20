module SavedGardens
  class Snapshot < Mutations::Command
    required do
      model  :device, class: Device
    end

    optional do
      string :name, default: "Untitled Garden"
    end

    def execute
      SavedGarden.transaction do
        @garden = SavedGarden.create!(inputs)
        create_templates_from_plants
      end
      ""
    end

    def create_templates_from_plants
      PlantTemplate.create!(device
                              .plants
                              .map do |plant|
                                { saved_garden_id: @garden.id,
                                  device_id:       device.id,
                                  radius:          plant.radius,
                                  x:               plant.x,
                                  y:               plant.y,
                                  z:               plant.z,
                                  name:            plant.name,
                                  openfarm_slug:   plant.openfarm_slug }
                              end)
    end
  end
end
