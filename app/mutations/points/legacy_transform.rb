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

      def migrate_tool
        # sql = "SELECT * FROM tools WHERE id = ?"
        # binding.pry
        # records_array = ActiveRecord::Base.connection.execute(sql)
      end
    end
end
