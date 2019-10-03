module PointGroups
  class Destroy < Mutations::Command
    STILL_IN_USE = "Can't delete group because it is in use by %{data_users}"

    required do
      model :device, class: Device
      model :point_group, class: PointGroup
    end

    def validate
      add_error "in_use", :in_use, human_readable_error if in_use?
    end

    def execute
      point_group.destroy! && ""
    end

    private

    def human_readable_error
      STILL_IN_USE % {
        data_users: sequences.pluck(:name).join(", "),
      }
    end

    def sequence_ids
      @sequence_ids ||= EdgeNode.where(kind: "point_group_id", value: point_group.id).pluck(:sequence_id)
    end

    def sequences
      @sequences ||= Sequence.find(sequence_ids)
    end

    def in_use?
      @in_use ||= sequences.any?
    end
  end
end
