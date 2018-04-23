module SavedGardens
  class Apply < Mutations::Command
    required do
      model   :device, class: Device
      model   :garden, class: SavedGarden
      boolean :destructive # Not yet implemented. RC 4/20/18
    end

    def execute
      clean_out_plants if destructive
      convert_templates_to_plants
      ""
    end

    private

    def convert_templates_to_plants
      Plant
        .create!(garden
        .plant_templates
        .map do |template|
          { device_id:     device.id,
            name:          template.name,
            openfarm_slug: template.openfarm_slug,
            plant_stage:   "planned",
            pointer_id:    0,
            radius:        template.radius,
            x:             template.x,
            y:             template.y,
            z:             template.z }
        end)
    end

    def clean_out_plants
      Points::Destroy.run!(device: device, point_ids: device.plants.pluck(:id))
    rescue Mutations::ValidationException => e
      binding.pry
    end
  end
end
