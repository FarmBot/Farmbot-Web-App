# One of the challenges with the CeleryScript "flat" representation is that
# nodes sometimes need forward references. Forward referencing nodes means that
# we can't know everything about a node until we pass over all nodes.
# Once we do pass over all nodes, we can go back and fill in the missing
# information.
class SecondPass < Mutations::Command
  CORPUS = CeleryScriptSettingsBag::Corpus.as_json({})
  KINDS  = (CORPUS[:nodes] + CORPUS[:args]).pluck("name")

  required do
    # model :sequence, class: Sequence
    array :nodes do # CeleryScript flat IR AST
      hash do
        string  :kind, in: KINDS
        integer :parent
        integer :child
        hash    :primary_nodes do integer :* end
        hash    :edge_nodes do duck :*, methods: :to_json end
        model   :instance, class: PrimaryNode, new_records: true
      end
    end
  end

  def execute
    nodes.map { |node| save_node(node) }
  end

  def save_node(node)
    # Set parent_id, child_id
    asign_parent_child(node)
    # Set arg nodes (primaries)
    assign_primary_arg_nodes(node)
    # Set arg nodes (edge nodes?)
    create_edge_arg_node(node)
    # Save edge nodes
    instance = node[:instance]
    instance.save!
    instance
  end

  def create_edge_arg_node(node)
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

  def assign_primary_arg_nodes(node)
    node[:primary_nodes]
      .to_a
      .map do |(parent_arg_name, value)|
        instance = nodes[value][:instance]
        instance.update_attributes!(parent_arg_name: parent_arg_name)
      end
  end

  def asign_parent_child(node)
    instance = node[:instance]
    parent   = get_node(node[:parent])
    child    = get_node(node[:child])

    child.save!  unless child.id
    parent.save! unless parent.id

    puts "Linking #{node[:kind]} to a #{get_node(node[:parent]).try(:kind) || "empty"} parent"
    instance
      .update_attributes!(parent_id: parent.id, child_id: child.id)
  end

  # Returns the node that is passed in unless it's a "nothing" node.
  def get_node(node_index)
    node     = nodes[node_index]
    instance = node[:instance]
    raise "BAD INDEX!" unless node && instance
    return instance
  end
end