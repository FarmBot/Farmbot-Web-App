# Service object that:
# 1. Pulls out all PrimaryNodes and EdgeNodes for a sequence node (AST Flat IR form)
# 2. Stitches the nodes back together in their "canonical" (nexted) AST
#    representation
class FetchCelery < Mutations::Command
  NodeContainer = Struct.new(:primary_nodes, :secondary_nodes)

  required do
    model :sequence, class: Sequence
  end

  def validate
    Rollbar.warn("N + 1 for edge_node")    unless sequence.edge_nodes.loaded?
    Rollbar.warn("N + 1 for primary_node") unless sequence.primary_nodes.loaded?
  end

  def execute
    # Step one: make sure PrimaryNodes and SecondaryNodes are eagerly loaded.
    build_sequence!
    return sequence_as_json
  end

private

  # This object gets mutated as the conversion passes over nodes.
  def sequence_as_json
    @sequence_as_json ||= { id:         sequence.id,
                            device_id:  sequence.device_id,
                            name:       sequence.name || "",
                            color:      sequence.color,
                            updated_at: sequence.updated_at,
                            created_at: sequence.created_at }
  end

  def build_sequence!
    binding.pry
  end
end
