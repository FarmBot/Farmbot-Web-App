require_relative "../../lib/hstore_filter"
# WHY??? ^
module Points
  class Create < Mutations::Command
    required do
      model  :device, class: Device
      float  :x
      float  :y
      float  :z
      float  :radius
      hstore :meta
    end

    optional do
      string :name
    end

    def execute
      stub = { pointer_type: "GenericPointer" }
      GenericPointer.create!(inputs.merge(stub))
    end
  end
end
