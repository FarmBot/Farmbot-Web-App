module PointGroups
  module Helpers
    BAD_POINT_IDS = "The group contains invalid points."

    def points
      @points ||= Point.where(id: point_ids, device: device)
    end

    def validate_point_ids
      unless point_ids == points.pluck(:id).sort
        add_error :points, :points_bad, BAD_POINT_IDS
      end
    end
  end
end
