module ToolSlots
  class Destroy < Mutations::Command
    STILL_IN_USE  = "Can't delete tool slot because the following sequences "\
                    "are still using it: %s"

    required { model :tool_slot, class: ToolSlot }

    def validate
      any_deps?
    end

    def execute
      tool_slot.destroy! && ""
    end

    def any_deps?
      if deps.any?
        names = deps.map(&:sequence).map(&:name).join(", ")
        add_error :tool_slot, :in_use, STILL_IN_USE % [names]
      end
    end

    def deps
      @deps ||= SequenceDependency.where(dependency: tool_slot)
    end
  end
end
