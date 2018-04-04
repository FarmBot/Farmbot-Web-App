module Points
  class Destroy < Mutations::Command
    STILL_IN_USE  = "Can't delete point because the following sequences "\
                    "are still using it: %s"

    required do
      model :device, class: Device
      array :point_ids, class: Integer
    end

    def validate
      # Collect names of sequences that still use this point.
      names = (tool_seq + point_seq).uniq.join(", ")
      add_error :point, :in_use, STILL_IN_USE % [names] if names.present?
    end

    def execute
      Point.transaction { points.map(&:destroy!) && "" }
    end

  private

    def points
      @points ||= Point.where(id: point_ids)
    end

    def every_tool_id_as_json
      # TODO: If we unify Plant/ToolSlot/GenericPointer,
      # this could be simplified.
      points
        .map { |x| x.pointer.try(:tool_id) }
        .compact
        .uniq
        .map(&:to_json)
        .map(&:to_i)
    end

    def point_seq
      @point_seq ||= EdgeNode
        .includes(:sequence)
        .where(kind: "pointer_id")
        .where(EdgeNode.value_is_one_of(*points.pluck(:id))) # WOW! -R.C.
        .pluck("sequences.name")
    end

    def tool_seq
      @tool_seq ||= InUseTool
        .where(tool_id: every_tool_id_as_json, device_id: device.id)
        .pluck(:sequence_name)
    end
  end
end
