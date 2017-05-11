module Points
  class Destroy < Mutations::Command
    Problem       = Struct.new("Problem",
                               :sequence_name,
                               :resource_name,
                               :resource_type)

    ALL_SEQ_DEPS  = "sequence_id IN"\
                    "(SELECT id FROM sequences WHERE sequences.device_id = ?)"
    STILL_IN_USE  = "Can't delete tool slot because the following sequences "\
                    "are still using it: %s"

    required do
      model :device, class: Device
      array :points,  class: Point
    end

    def validate
      any_deps?
    end

    def execute
      # Probably slow. TODO: Optimize if Skylight complains.
      Point.transaction { points.map(&:destroy!) && "" }
    end

private

    def any_deps?
      if deps.any?
        names = deps.map(&:name).join(", ")
        add_error :tool_slot, :in_use, STILL_IN_USE % [names]
      end
    end

    def deps
      # What do we need to check?
      #   * Plant in use?
      #   * ToolSlot in use?
      #   * Point in use?
      #   * Tool in use?
      @deps ||= calculate_deps
    end
    "Sequence 'sequence.NAME' is using (tool|point.pointer_type).RESOURCE NAME "
    def calculate_deps
      cant_delete    = SequenceDependency
                        .where(ALL_SEQ_DEPS, device.id)
                        .pluck(:dependency_type, :dependency_id)
                        .map{ |pair| pair.join(".") }

      want_to_delete = Point
                        .pluck(:dependency_type, :dependency_id)
                        .map{ |pair| pair.join(".") }
      intersection   = cant_delete & want_to_delete
      return intersection
    end

    def points_in_use
    end
  end
end
