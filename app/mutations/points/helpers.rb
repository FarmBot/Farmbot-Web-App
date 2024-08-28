module Points
    module Helpers
      BAD_CURVE_ID = "Curve ID is not valid"

      def validate_water_curve_id
        if water_curve_id && !device.curves.exists?(water_curve_id)
          add_error :water_curve_id, :water_curve_id, BAD_CURVE_ID
        end
      end

      def validate_spread_curve_id
        if spread_curve_id && !device.curves.exists?(spread_curve_id)
          add_error :spread_curve_id, :spread_curve_id, BAD_CURVE_ID
        end
      end

      def validate_height_curve_id
        if height_curve_id && !device.curves.exists?(height_curve_id)
          add_error :height_curve_id, :height_curve_id, BAD_CURVE_ID
        end
      end
    end
  end
