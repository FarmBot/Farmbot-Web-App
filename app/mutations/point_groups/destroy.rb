module PointGroups
  class Destroy < Mutations::Command
    STILL_IN_USE = "Can't delete group because it is in use by %{data_users}"
    ARG_NAME_ID = ArgName.find_or_create_by!(value: "point_group_id").id

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
      sequence_list = sequences.join(", ")
      fragment_users_list = fragment_users.join(", ")
      STILL_IN_USE % { data_users: sequence_list + fragment_users_list }
    end

    def sequence_ids
      @sequence_ids ||= EdgeNode.where(kind: "point_group_id", value: point_group.id).pluck(:sequence_id)
    end

    def sequences
      @sequences ||= Sequence
        .find(sequence_ids)
        .pluck(:name)
        .map { |x| "sequence '#{x}'" }
    end

    def fragment_users
      if @fragment_users
        @fragment_users
      else
        my_fragment_ids = Fragment
          .where(device_id: device.id)
          .pluck(:id)
        primitives = Primitive
          .where(fragment_id: my_fragment_ids)
          .where(value: point_group.id)
        relevant_fragments = PrimitivePair
          .where(arg_name_id: ARG_NAME_ID)
          .where(primitive_id: primitives.pluck(:id))
          .pluck(:fragment_id)
          .uniq
        @fragment_users = Fragment
          .find(relevant_fragments)
          .map(&:owner)
          .map { |x| "#{x.class} '#{x.fancy_name}'" }
      end
    end

    def in_use?
      @in_use ||= (sequences.any? || fragment_users.any?)
    end
  end
end
