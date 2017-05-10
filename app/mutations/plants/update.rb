module Plants
  class Update < Mutations::Command
    # required do
    #   model :device, class: Device
    #   model :plant, class: Plant
    # end

    # optional do
    #   float  :radius
    #   float  :x
    #   float  :y
    #   string :name
    #   string :openfarm_slug
    # end

    # def execute
    #   plant
    #     .point
    #     .update_attributes!(update_params) && plant.reload
    #   # plant.update_attributes!(inputs.except(:device, :plant)) && plant
    # end

    # def update_params
    #   plant.assign_attributes(inputs.slice(:openfarm_slug))
    #   inputs
    #     .slice(*Point::SHARED_FIELDS)
    #     .merge(pointer: plant)
    # end
  end
end
