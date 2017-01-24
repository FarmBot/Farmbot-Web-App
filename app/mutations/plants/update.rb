module Plants
  class Update < Mutations::Command
    required do
      model :device, class: Device
      model :plant, class: Plant
    end

    optional do
      float :x
      float :y
      string :name
      string :img_url
      string :icon_url
      string :openfarm_slug
      time :created_at
    end

    def execute
      plant.update_attributes(inputs.except(:device, :plant))
    end
  end
end
