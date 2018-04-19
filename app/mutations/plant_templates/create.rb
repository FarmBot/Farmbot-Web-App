module PlantTemplates
  class Create < Mutations::Command
    required do
      integer :saved_garden_id
      model   :device, class: Device
      float   :x
      float   :y
    end

    optional do
      string :openfarm_slug  # "null"
      string :name           # "untitled"
      float  :z              # 0.0
      float  :radius         # 25
    end

    def execute
      PlantTemplate.create!(creation_params)
    end

    private

    def creation_params
      @creation_params ||= inputs.except(:saved_garden_id).merge({
        saved_garden: device.saved_gardens.find(saved_garden_id)
      })
    end
  end
end
