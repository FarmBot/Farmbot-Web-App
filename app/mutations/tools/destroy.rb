module Tools
  class Destroy < Mutations::Command
    STILL_IN_USE = "Can't delete tool or seed container because the " \
                   "following sequences are still using it: %s"
    STILL_IN_SLOT = "Can't delete tool or seed container because it is " \
                    "still in a slot. Please remove it from the slot first."

    # CeleryScript Arguments that might still be using the current tool:
    SUSPECTS = ["pointer_id", "resource_id", "value"]

    required do
      model :tool, class: Tool
    end

    def validate
      any_deps?
      any_slots?
    end

    def execute
      maybe_unmount_tool
      tool.destroy!
    end

    private

    # This one will look for other nodes that can possibly reference
    # a tool's ID, usually within the MARK AS step.
    # TODO: Write a real SQL view for this. Too busy right now.
    # This whole method is unfortunate.
    def other_names
      sequence_ids = Sequence.where(device: tool.device).pluck(:id)
      query = { sequence_id: sequence_ids, kind: SUSPECTS, value: tool.id }
      ids = EdgeNode.where(**query).pluck(:primary_node_id)
      PrimaryNode.includes(:edge_nodes).where(id: ids).map do |node|
        node.edge_nodes.pluck(:kind, :value).to_h.symbolize_keys.merge({
          kind: node.kind,
          sequence_id: node.sequence_id,
        })
      end.each_with_object(Set.new) do |i, results|
        kind = i.fetch(:kind)
        if kind == "pair" &&
           i.fetch(:label) == "mounted_tool_id" &&
           i.fetch(:value) == tool.id
          results.add(i.fetch(:sequence_id))
        end
      end
                 .to_a
                 .map { |x| Sequence.find(x).name }
    end

    def slot
      @slot ||= tool.tool_slot
    end

    def any_slots?
      add_error :tool, :in_slot, STILL_IN_SLOT if slot.present?
    end

    def any_deps?
      add_error :tool, :in_use, STILL_IN_USE % [names] if names.present?
    end

    def names
      @names ||= InUseTool
        .where(tool_id: tool.id)
        .pluck(:sequence_name)
        .concat(other_names)
        .uniq
        .join(", ")
    end

    def maybe_unmount_tool
      if tool.device.mounted_tool_id == tool.id
        tool.device.update!(mounted_tool_id: nil)
      end
    end
  end
end
