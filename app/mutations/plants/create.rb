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
      float  :radius
      float  :z, default: 0
    end

    def execute
      Point
        .create!(inputs.slice(:x, :y, :z).merge(pointer: pointer))
        .pointer
    end

    def pointer
      Plant.new(inputs.slice(:device, :name, :tool_id))
    end
  end
end
