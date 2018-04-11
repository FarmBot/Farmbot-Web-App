module Points
  class Destroy < Mutations::Command
    STILL_IN_USE  = "The sequence '%s' is still using the following points: %s"

    required do
      model :device, class: Device
      array :point_ids, class: Integer
    end

    optional { boolean :hard_delete, default: false }

    def validate
      # Collect names of sequences that still use this point.
      errors = (tool_seq + point_seq)
        .group_by(&:sequence_name)
        .to_a
        .map do |(seq_name, data)|
          [ seq_name, data.map(&:fancy_name).uniq.sort.join(", ") ]
        end
        .map { |data| STILL_IN_USE % data }
        .join(". ")
      add_error :point, :in_use, errors if errors.present?
    end

    def execute
      hard_delete ?
        points.destroy_all : points.update_all(discarded_at: Time.now)
    end

  private

    def points
      @points ||= Point.where(id: point_ids)
    end

    def every_tool_id_as_json
      points
        .where.not(tool_id: nil)
        .pluck(:tool_id)
        .uniq
        .map(&:to_json)
        .map(&:to_i)
    end

    def point_seq
      @point_seq ||= InUsePoint
        .where(point_id: points.pluck(:id))
        .to_a
    end

    def tool_seq
      @tool_seq ||= InUseTool
        .where(tool_id: every_tool_id_as_json, device_id: device.id)
        .to_a
    end
  end
end
