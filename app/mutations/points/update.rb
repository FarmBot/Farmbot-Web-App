module Points
  class Update < Mutations::Command
    required do
      model :device, class: Device
    end

    optional do
      float :x
      float :y
      float :radius
      hash :meta do
        string  :*
        boolean :*
        float   :*
      end
    end

    def execute
      Point.create!(inputs)
    end
  end
end
