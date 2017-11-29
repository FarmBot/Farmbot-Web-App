module Points
  # Logic for tool removal was complicated enough to warrant its own
  # mutation object.
  class ToolRemovalCheck < Mutations::Command
    IN_USE = "Tool in use by the following sequences: %s"

    required do
      model   :point,  class: Point
      # Does nil `next_tool_id` mean "I have nothing to say"?
      # Or does it mean: "I want to clear something out"?
      boolean :attempting_change
      integer :next_tool_id, nils: true, empty_is_nil: true
    end

    def validate
      nope! if still_in_use?
      # Are they trying to change tool_id?
      # Are they trying to detach a tool?
      # Was the tool in use?
    end

    def execute
      true
    end

  private

    def is_removal_attempt
      (attempting_change &&       # Wants to make a change
       (next_tool_id === nil) &&  # Wants to remove tool_id
       point.pointer.tool)        # Currently has a tool_id
    end

    def still_in_use?
      is_removal_attempt && deps.any?
    end

    def nope!
      names = Sequence
        .where(id: deps.pluck(:sequence_id))
        .pluck(:name)
        .join(", ")
      add_error :in_use, :in_use, (IN_USE % [names])
    end

    def is_tool_slot?
      point.pointer_type == "ToolSlot"
    end

    def current_tool_id
      point.pointer.tool && point.pointer.tool.id
    end

    def deps
      @deps ||= SequenceDependency.where(dependency_type: "Tool",
                                         dependency_id:   current_tool_id)
    end
  end
end
