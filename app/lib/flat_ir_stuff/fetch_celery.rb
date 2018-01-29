class FetchCelery < Mutations::Command
  NodeContainer = Struct.new(:primary_nodes, :secondary_nodes)
  required do
    array :sequences, class: Sequence
  end

  def validate
    Rollbar.warn("N + 1 for edge_node") unless sequences.first.edge_nodes.loaded?
    Rollbar.warn("N + 1 for primary_node") unless sequences.first.primary_nodes.loaded?
  end

  def execute
    # Step one: make sure PrimaryNodes and SecondaryNodes are eagerly loaded.
    primary_nodes
    return sequences
  end

private

  def primary_nodes
    @primary_nodes ||= PrimaryNode
      .where(sequence_id: sequences.map(&:id))
  end

  def secondary_nodes
    @secondary_nodes ||= SecondaryNode.where(sequence_id: sequences.pluck(:id))
  end
end
