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
      @still_in_use ||= calculate_deps
    end

    def all_deps
      @all_deps ||= SequenceDependency.where(ALL_SEQ_DEPS, device.id)
    end

    # point => tool_slot => tool
    def calculate_deps
      all_deps
        .where(dependency_type: "Point", dependency_id: points.pluck(:id)) # NEXT: Add an "OR" for tracking tools
        .or(refactor_plz)
        .map(&:sequence)
    end

    def refactor_plz
      all_deps.where(dependency_type: "Tool",
                     dependency_id: points
                                      .select { |p| p.pointer_type == "ToolSlot" }
                                      .map(&:pointer)
                                      .map(&:tool)
                                      .pluck(:id))
    end
  end
end
