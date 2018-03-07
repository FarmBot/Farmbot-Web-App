module Points
  class Destroy < Mutations::Command
    STILL_IN_USE  = "Can't delete point because the following sequences "\
                    "are still using it: %s"

    required do
      model :device, class: Device
      array :points, class: Point
    end

    def validate
      # Collect names of sequences that still use this point.
      names = Sequence
        .where(id: (tool_seq + point_seq).uniq)
        .pluck(:name)
        .join(", ")

      add_error :point, :in_use, STILL_IN_USE % [names] if names.present?
    end

    def execute
      Point.transaction { points.map(&:destroy!) && "" }
    end

  private

    def every_tool_id_as_json
      # TODO: If we unify Plant/ToolSlot/GenericPointer, this could be
      # simplified.
      points
        .map { |x| x.pointer.try(:tool_id) }
        .compact
        .uniq
        .map(&:to_json)
    end

    def point_seq
      @point_seq ||= EdgeNode
        .where(kind: "pointer_id")
        .where(EdgeNode.arel_table[:value].in(points.pluck(:id))) # WOW! -R.C.
        .pluck(:sequence_id)
    end

    def tool_seq
      @tool_seq ||= EdgeNode
        .where(kind: "tool_id")
        .where("value = ?", every_tool_id_as_json)
        .pluck(:sequence_id)
    end
  end
end
