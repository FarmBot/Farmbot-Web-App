require_relative "../../lib/hstore_filter"
# WHY??? ^
module Points
    class Query < Mutations::Command
      H_QUERY = "meta @> hstore(:key, :value)"

      required do
        model :device, class: Device
      end

      optional do
        float    :radius
        float    :x
        float    :y
        float    :z
        hstore   :meta
        string   :name
      end

      def execute
        points
      end

      def points
        return @points if @points
        @points = Point.where(device: device).where(inputs.except(:device))
        add_meta_fields if meta
        @points
      end

      def add_meta_fields
        meta.map do |(key, value)|
          @points = @points.where(H_QUERY, key: key, value: value)
        end
      end
    end
end
