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
    end

    def execute
      Plant.create!(inputs)
    end
  end
end
