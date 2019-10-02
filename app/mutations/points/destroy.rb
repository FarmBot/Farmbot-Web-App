module Points
  class Destroy < Mutations::Command
    STILL_IN_USE = "Could not delete the following item(s): %s. Item(s) are " \
    "in use by the following sequence(s): %s."
    JUST_ONE = "Could not delete %s. Item is in use by the following " \
               "sequence(s): %s."

    required do
      model :device, class: Device
    end

    optional do
      boolean :hard_delete, default: true
      array :point_ids, class: Integer
      model :point, class: Point
    end

    P = :point
    S = :sequence

    def validate
      maybe_wrap_ids
      # Collect names of sequences that still use this point.
      problems = (tool_seq + point_seq + resource_update_seq)
        .group_by(&:sequence_name)
        .to_a
        .reduce({ S => [], P => [] }) do |total, (seq_name, data)|
        total[S].push(seq_name)
        total[P].push(*(data || []).map(&:fancy_name))
        total
      end

      p = problems[P].sort.uniq.join(", ")

      if p.present?
        sequences = problems[S].sort.uniq.join(", ")
        message = (point_ids.count > 1) ? STILL_IN_USE : JUST_ONE
        problems = message % [p, sequences]

        add_error :whoops, :in_use, problems
      end
    end

    def execute
      if hard_delete
        points.destroy_all
      else
        Point.transaction do
          archive_points
          destroy_all_others
        end
      end
    end

    private

    def archive_points
      points
        .where(pointer_type: "GenericPointer")
        .discard_all
    end

    def destroy_all_others
      points
        .where
        .not(pointer_type: "GenericPointer")
        .destroy_all
    end

    def points
      @points ||= Point.where(id: point_ids)
    end

    def every_tool_id_as_json
      points
        .where
        .not(tool_id: nil)
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

    def resource_update_seq
      @resource_update_seq ||= ResourceUpdateStep
        .includes(:point)
        .where(point_id: point_ids)
    end

    def tool_seq
      @tool_seq ||= InUseTool
        .where(tool_id: every_tool_id_as_json, device_id: device.id)
        .to_a
    end

    def maybe_wrap_ids
      raise "NO" unless (point || point_ids)
      inputs[:point_ids] = [point.id] if point
    end
  end
end
