module Plants
  class Create < Mutations::Command
    required do
      model :device, class: Device
      float :x
      float :y
    end

    optional do
      string   :name, default: "Unknown Plant"
      string   :openfarm_slug, default: "not-set"
      time     :created_at
      float    :radius, default: 25
      float    :z, default: 0
      time     :planted_at, default: 0
      string   :plant_stage, in: CeleryScriptSettingsBag::PLANT_STAGES
    end

    def execute
      stub = { pointer_type: "Plant" }
      Plant.create!(inputs.merge(stub))
    end
  end
end
