require_relative "../../lib/hstore_filter"
# WHY??? ^
module Points
    class Query < Mutations::Command
      H_QUERY = "meta -> :key = :value"

      required do
        duck :scope, method: [:where]
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
        @points ||= conditions.reduce(scope) do |collection, query|
          collection.where(query)
        end
      end

      def conditions
        @conditions ||= regular_conditions + meta_conditions
      end

      def meta_conditions
        @meta_conditions ||= (meta || {}).map do |(k,v)|
          [H_QUERY, {key: k, value: v}]
        end
      end

      def regular_conditions
        @regular_conditions ||= [inputs.except(:scope, :meta)]
      end
    end
end
