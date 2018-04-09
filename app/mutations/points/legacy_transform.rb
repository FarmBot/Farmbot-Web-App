module Points
    class LegacyTransform < Mutations::Command

      required do
        model :device, class: Device
        model :point,  class: Point
      end

      optional do
      end

      def execute
        raise "This is next"
      end
    end
end
