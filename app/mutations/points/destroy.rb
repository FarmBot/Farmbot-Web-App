module Points
  class Destroy < Mutations::Command
    Problem       = Struct.new("Problem",
                               :sequence_name,
                               :resource_name,
                               :resource_type)

    ALL_SEQ_DEPS  = "sequence_id IN"\
                    "(SELECT id FROM sequences WHERE sequences.device_id = ?)"

    STILL_IN_USE  = "Can't delete point because the following sequences "\
                    "are still using it: %s"

    "Sequence 'foo' still needs to use 'bar' named 'baz'"
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
      if still_in_use.any?
        names = still_in_use.map(&:name).join(", ")
        add_error :point, :in_use, STILL_IN_USE % [names]
      end
    end

    def still_in_use
      # What do we need to check?
      #   * Point in use?
      #   * Tool in use?
      @still_in_use ||= calculate_deps
    end

    # point => tool_slot => tool
    def calculate_deps
      SequenceDependency
        .where(ALL_SEQ_DEPS, device.id)
        .where(dependency_type: "Point")
        .where(dependency_id: points.pluck(:id))
        .map(&:sequence)
    end

    def points_in_use
    end
  end
end
