module PointGroups
  class Create < Mutations::Command
    BAD_POINT_IDS = "The group contains invalid points."

    required do
      model :device, class: Device
      string :name
      array :point_ids, class: Integer
    end

    def validate
      point_ids.sort!
      validate_point_ids
    end

    def execute
      PointGroup.transaction do
        PointGroupItem.transaction do
          pg = PointGroup.new(name: name, device: device)
          point_ids.map do |id|
            pg.point_group_items << PointGroupItem.new(point_id: id)
          end
          pg.save!
          pg
        end
      end
    end

    private

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
