module Plants
  class Create < Mutations::Command
    required do
      model :device, class: Device
      float :x
      float :y
    end

    optional do
      string :name, default: "Unknown Plant"
      string :openfarm_slug, default: "not-set"
      time   :created_at
      float  :radius, default: 50
      float  :z, default: 0
    end

    def execute
      Point.create!(creation_params).pointer
    end

    def creation_params
      inputs
        .slice(:x, :y, :z, :device, :name, :radius)
        .merge(pointer: pointer)
    end

    def pointer
      Plant.new(inputs.slice(:openfarm_slug))
    end
  end
end
