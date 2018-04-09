module Points
    class LegacyTransform < Mutations::Command

      required do
        model :device, class: Device
        model :point,  class: Point
      end

      optional do
      end

      def execute
        perform_migration unless point.migrated_at
      end

      def perform_migration
        Point.transaction do
          t = point.pointer_type
          case t
          when "ToolSlot"
          when "Plant"
          when "GenericPointer"
          else
            puts "Point #{point.id} has unknown pointer_type '#{t}'"
          end
        end
      end

      def migrate_tool
        # sql = "SELECT * FROM tools WHERE id = ?"
        # binding.pry
        # records_array = ActiveRecord::Base.connection.execute(sql)
      end
    end
end
