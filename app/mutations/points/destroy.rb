module Points
  class Destroy < Mutations::Command
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
      []
      # # TODO: Optimize this ridiculous mess.
      # #       RC 5 May 17
      # @deps ||= Sequence.where(id: [tool_slot, tool_slot.tool]
      #                                   .compact
      #                                   .map { |x| x&.sequence_dependencies }
      #                                   .compact
      #                                   .flatten
      #                                   .map(&:sequence_id)
      #                                   .compact)
    end
  end
end
