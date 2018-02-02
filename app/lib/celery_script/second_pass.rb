# One of the challenges with the CeleryScript "flat" representation is that
# nodes sometimes need forward references. Forward referencing nodes means that
# we can't know everything about a node until we pass over all nodes.
# Once we do pass over all nodes, we can go back and fill in the missing
# information.
module CeleryScript
class SecondPass < Mutations::Command
  CORPUS = CeleryScriptSettingsBag::Corpus.as_json({})
  KINDS  = (CORPUS[:nodes] + CORPUS[:args]).pluck("name")

  required do
    array :nodes do # CeleryScript flat IR AST
      hash do
        string  :kind, in: KINDS
        integer :parent
        integer :next
        integer :body
        hash    :primary_nodes do integer :* end
        hash    :edge_nodes do duck :*, methods: :to_json end
        model   :instance, class: PrimaryNode, new_records: true
      end
    end
  end

  def execute
    ActiveRecord::Base.transaction do
      nodes.map { |node| save_node(node) }
    end
  end

  def save_node(node)
    # Set parent_id, body_id, next_id
    attach_body_parent_and_next_node(node)
    # Set arg nodes (primaries)
    attach_primary_args(node)
    # Set arg nodes (edge nodes?)
    add_edge_args(node)
    # Save edge nodes
    instance = node[:instance]
    instance.save! if instance.changed?
    instance
  end

  def add_edge_args(node)
    instance = node[:instance]
    node[:edge_nodes]
      .to_a
      .map do |(kind, value)|
        EdgeNode.create!(sequence: instance.sequence,
                         primary_node: instance,
                         kind: kind,
                         value: value)
      end
  end

  def attach_primary_args(node)
    node[:primary_nodes]
      .to_a
      .map do |(parent_arg_name, value)|
        instance = nodes[value][:instance]
        instance.update_attributes!(parent_arg_name: parent_arg_name)
      end
  end

  def attach_body_parent_and_next_node(node)
    instance = node[:instance]
    [
      parent = get_node(node[:parent]),
      body   = get_node(node[:body]),
      next_  = get_node(node[:next]),
    ].map { |relative_node| relative_node.save! unless relative_node.id }

    instance
      .update_attributes!(parent_id: parent.id,
                          body_id:   body.id,
                          next_id:   next_.id)
  end

  # Returns the node that is passed in unless it's a "nothing" node.
  def get_node(node_index)
    node     = nodes[node_index]
    instance = node[:instance]
    raise "BAD INDEX!" unless node && instance
    return instance
  end
end
end