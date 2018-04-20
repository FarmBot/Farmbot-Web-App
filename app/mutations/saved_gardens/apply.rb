module SavedGardens
  class Apply < Mutations::Command
    required do
      model   :device, class: Device
      model   :garden, class: SavedGarden
      boolean :destructive # Not yet implemented. RC 4/20/18
    end

    def execute
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
      ""
    end
  end
end
