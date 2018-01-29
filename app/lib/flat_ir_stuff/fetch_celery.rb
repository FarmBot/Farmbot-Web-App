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
