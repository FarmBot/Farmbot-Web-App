module Plants
  class Update < Mutations::Command
    required do
      model :device, class: Device
      model :plant, class: Plant
    end

    optional do
      float  :x
      float  :y
      string :name
      string :openfarm_slug
      time   :created_at
      float  :radius
    end

    def execute
      plant.update_attributes!(inputs.except(:device, :plant)) && plant
    end
  end
end
