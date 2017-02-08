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

    def execute
      Point.create!(inputs)
    end
  end
end
