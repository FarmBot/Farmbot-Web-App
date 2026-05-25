module Points
  class Destroy < Mutations::Command
    STILL_IN_USE = "Could not delete %s. Items are in use by %s."
    JUST_ONE = "Could not delete %s. Item is in use by %s."

    required do
      model :device, class: Device
    end

    optional do
      array :point_ids, class: Integer
      model :point, class: Point
    end

    P = :point
    S = :sequence

    def validate
      maybe_wrap_ids
      problems = point_usage.each_with_object({ S => [], P => [] }) do |usage, total|
        owner, point = usage
        total[S].push(owner_name(owner))
        total[P].push(point.fancy_name)
      end

      p = problems[P].sort.uniq.join(", ")

      if p.present?
        owners = problems[S].sort.uniq.join(", ")
        message = point_ids.many? ? STILL_IN_USE : JUST_ONE
        problems = format(message, p, owners)

        add_error :whoops, :in_use, problems
      end
    end

    def execute
      Point.transaction do
        PointGroupItem.transaction do
          clean_up_groups
          points.destroy_all
        end
      end
    end

    private

    def point_groups
      @point_groups ||=
        PointGroup.find(point_group_items.pluck(:point_group_id).uniq)
    end

    def point_group_items
      @point_group_items ||=
        PointGroupItem.where(point_id: point_ids || point.id)
    end

    def clean_up_groups
      # Cache relations *before* deleting PGIs.
      pgs = point_groups
      point_group_items.destroy_all
      pgs.map do |x|
        # WOW, THIS IS COMPLICATED.
        # Why are you calling `SecureRandom.uuid`, Rick?
        # """
        # If you don't give the auto_sync message
        # a fresh session_id, the frontend will
        # think it is an "echo" and cancel it out.
        # """ - Rick
        x.update!(updated_at: Time.now)
        x.broadcast!(SecureRandom.uuid)
      end
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

    def point_usage
      @point_usage ||= sequence_point_usage + fragment_point_usage
    end

    def sequence_point_usage
      @sequence_point_usage ||= sequence_usage
        .group_by(&:sequence_id)
        .to_a
        .flat_map do |(sequence_id, data)|
        sequence = sequence_owners[sequence_id]
        next [] unless sequence

        (data || []).map { |point| [sequence, point] }
      end
    end

    def sequence_usage
      @sequence_usage ||= tool_seq + point_seq + resource_update_seq
    end

    def sequence_owners
      @sequence_owners ||= Sequence
        .where(id: sequence_usage.map(&:sequence_id).uniq)
        .index_by(&:id)
    end

    def fragment_point_usage
      @fragment_point_usage ||= begin
        primitives = point_ids.flat_map do |point_id|
          Primitive
            .where(fragment_id: fragment_owner_ids)
            .where(value: point_id)
        end
        pairs = PrimitivePair
          .includes(:primitive)
          .where(arg_name_id: ArgName.find_or_create_by!(value: "pointer_id").id)
          .where(primitive_id: primitives.map(&:id))
        owners = Fragment
          .includes(:owner)
          .where(id: pairs.map(&:fragment_id).uniq)
          .index_by(&:id)
        points_by_id = points.index_by(&:id)

        pairs.each_with_object([]) do |pair, result|
          owner = owners[pair.fragment_id]&.owner
          point = points_by_id[pair.primitive.value]
          result.push([owner, point]) if owner && point
        end
      end
    end

    def fragment_owner_ids
      @fragment_owner_ids ||= Fragment
        .where(device_id: device.id,
               owner_type: [FarmEvent.name, Regimen.name])
        .pluck(:id)
    end

    def owner_name(owner)
      "#{owner.class.name} '#{owner.fancy_name}'"
    end

    def maybe_wrap_ids
      raise "NO" unless (point || point_ids)

      inputs[:point_ids] = [point.id] if point
    end
  end
end
