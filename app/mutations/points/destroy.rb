module Points
  class Destroy < Mutations::Command
    STILL_IN_USE  = "Can't delete point because the following sequences "\
                    "are still using it: %s"

    required do
      model :device, class: Device
      array :points, class: Point
    end

    def validate
      # Collect sequence ids for all `point_id` args
      sequence_ids = EdgeNode
        .where(kind: "point_id", value: points.map(&:id))
        .pluck(:sequence_id)
        .uniq
      # COllect names of sequences that still use this point.
      still_in_use = Sequence.where(id: sequence_ids).pluck(:name).join(", ")

      add_error :point, :in_use, STILL_IN_USE % [names] if still_in_use.present?
    end

    def execute
      Point.transaction { points.map(&:destroy!) && "" }
    end
  private
  end
end
