module SavedGardens
  class Apply < Mutations::Command
    required do
      model   :device, class: Device
      model   :garden, class: SavedGarden
      boolean :destructive # Not yet implemented. RC 4/20/18
    end

    def validate
      plant_safety_check if destructive
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
    end

    def plant_safety_check
      add_error :whoops, :whoops, "whoops" if in_use_plants.count > 0
    end

    def in_use_plants
      binding.pry # Hmmm...
      @in_use_plants ||= device.in_use_points.where(point_type: "Plant")
    end
  end
end
