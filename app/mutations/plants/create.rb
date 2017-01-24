module Plants
  class Create < Mutations::Command
    required do
      model :device, class: Device
      float :x
      float :y
    end

    optional do
      string :name, default: "Unknown Plant"
      string :img_url, default: "//placehold.it/200x150"
      string :icon_url, default: "/app-resources/img/icons/Sprout-96.png"
      string :openfarm_slug, default: "not-set"
      time   :created_at#, default: ->{ Time.now.utc }
    end

    def execute
      Plant.create!(inputs)
    end
  end
end
