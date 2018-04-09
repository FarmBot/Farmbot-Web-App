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
        @points = Point.where(inputs.except(:device))
        add_meta_fields if meta
        @points
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
