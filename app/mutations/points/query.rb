module Points
    class Query < Mutations::Command
      H_QUERY = "meta @> hstore(:key, :value)"

      required do
        model :device, class: Device
      end

      optional do
        hstore :meta
      end

      def execute
          points
      end

      def points
        if @points
          @points
        else
          @points = Point.where(device: device)
          add_meta_fields if meta
          @points
        end
      end

      def add_meta_fields
        meta
          .to_a
          .each do |x|
            @points = @points.where(H_QUERY, key: x[0] , value: x[1])
          end
      end
    end
end