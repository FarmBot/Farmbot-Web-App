module Curves
  class Destroy < Mutations::Command
    STILL_IN_USE = "Can't delete curve because it is in use by %{data_users}"

    required do
      model :device, class: Device
      model :curve, class: Curve
    end

    def validate
      add_error "in_use", :in_use, human_readable_error if in_use?
    end

    def execute
      curve.destroy! && ""
    end

    private

    def human_readable_error
      point_list = points.join(", ")
      STILL_IN_USE % { data_users: point_list }
    end

    def point_ids
      @point_ids ||= Point.where(water_curve_id: curve.id).pluck(:id)
                     .concat(Point.where(spread_curve_id: curve.id).pluck(:id))
                     .concat(Point.where(height_curve_id: curve.id).pluck(:id))
    end

    def points
      @points ||= Point
        .find(point_ids)
        .pluck(:name)
        .map { |x| "plant '#{x}'" }
    end

    def in_use?
      @in_use ||= (points.any?)
    end
  end
end
