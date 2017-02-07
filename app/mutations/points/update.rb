module Points
  class Update < Mutations::Command
    required do
      model :device, class: Device
      model :point, class: Point
    end

    optional do
      float  :x
      float  :y
      float  :z
      float  :radius
      hstore :meta
    end

    def execute
      point.update_attributes!(inputs.except(:device, :point))
      point
    end
  end
end
