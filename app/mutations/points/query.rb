require_relative "../../lib/hstore_filter"
# WHY??? ^
module Points
    class Query < Mutations::Command
      H_QUERY = "meta -> :key = :value"

      required do
        duck :points, method: [:where]
      end

      optional do
        float  :radius
        float  :x
        float  :y
        float  :z
        hstore :meta
        string :name
        string :pointer_type, in: Point::POINTER_KINDS
        string :plant_stage,  in: CeleryScriptSettingsBag::PLANT_STAGES
        string :openfarm_slug
      end

      def execute
        search_results
      end

      def search_results
        @search_results ||= conditions.reduce(points) do |collection, query|
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
        @regular_conditions ||= [inputs.except(:points, :meta)]
      end
    end
end
