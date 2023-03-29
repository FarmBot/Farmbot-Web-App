module Curves
  module Helpers
    def validate_curve_type
      if type
        bad_curve_type! unless valid_curve_type?
      end
    end

    def bad_curve_type!
      add_error :curve_type,
                :curve_type_bad,
                Curve::BAD_TYPE % { value: type }
    end

    def valid_curve_type?
      Curve::CURVE_TYPES.include?(type)
    end
  end
end
