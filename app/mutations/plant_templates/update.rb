module PlantTemplates
  class Update < Mutations::Command
    required do
      model   :device,         class: Device
      model   :plant_template, class: PlantTemplate
    end

    optional do
      float   :radius
      float   :x
      float   :y
      float   :z
      integer :saved_garden_id
      string  :name
      string  :openfarm_slug
    end

    def execute
      plant_template.update_attributes!(update_params)
      plant_template
    end

    def update_params
      @update_params ||= inputs
        .except(:saved_garden_id, :device, :plant_template)
        .merge(saved_garden)
    end

    def saved_garden
      if saved_garden_id
        { saved_garden: device.saved_gardens.find(saved_garden_id) }
      else
        {}
      end
    end
  end
end
