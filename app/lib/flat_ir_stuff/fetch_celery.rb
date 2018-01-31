# Service object that:
# 1. Pulls out all PrimaryNodes and EdgeNodes for a sequence node (AST Flat IR form)
# 2. Stitches the nodes back together in their "canonical" (nexted) AST
#    representation
class FetchCelery < Mutations::Command
  required do
    model :sequence, class: Sequence
  end

  def validate
    Rollbar.warn("N + 1 for edge_node")    unless sequence.edge_nodes.loaded?
    Rollbar.warn("N + 1 for primary_node") unless sequence.primary_nodes.loaded?
  end

  def execute
    # Step one: make sure PrimaryNodes and SecondaryNodes are eagerly loaded.
    build_sequence!.deep_symbolize_keys.tap{ |x| binding.pry }
  end

private

  def build_sequence!
    return recurse_into_node(entry_node)
  end

  # All nodes that point to this node as their `parent_id` or `child_id`
  # indicate a `nil` condition, but without using falsyness.
  def null_node
    @null_node ||= primary_nodes.by.id[entry_node.parent_id].first
  end

  # The topmost node in a sequence.
  def entry_node
    @entry_node ||= primary_nodes.by.kind["sequence"].first
  end

  def recurse_into_node(node)
    raise "no" unless node.is_a?(PrimaryNode)
    child = primary_nodes.by.id[node.child_id]
    output = {
      kind: node.kind,
      args: recurse_into_args(node),
    }
    body = recurse_into_body(node)
    output[:body] = body if !(child == null_node) && body.present?

    return output
  end

  def recurse_into_args(node)
    result  = {}
    add_p_nodes(result, primary_nodes.by.parent_id[node.id]    || [])
    add_e_nodes(result, edge_nodes.by.primary_node_id[node.id] || [])
    result
  end

  def add_e_nodes(arg_hash, node_array)
    node_array.map { |node| arg_hash[node.kind] = node.value }
  end

  def add_p_nodes(arg_hash, node_array)
    node_array.map do |node|
      if node.parent_arg_name # No parent_arg_name means it is a body item.
        key = node.parent_arg_name
        arg_hash[key] = recurse_into_node(node)
      end
    end
  end

  def recurse_into_body(node, body_nodes = [], parent_id = node.parent_id)
    all = primary_nodes.by.id[node.child_id]
    raise "No way!" if all.length > 1
    next_item = all.first

    if (next_item != null_node) && (next_item.is_body_item?)
      wow = recurse_into_node(next_item)
      body_nodes.push(wow)
      recurse_into_body(next_item, body_nodes, parent_id)
    end

    body_nodes
  end

  def edge_nodes
    @edge_nodes  ||= Indexer.new(sequence.edge_nodes)
  end

  def primary_nodes
    @primary_nodes ||= Indexer.new(sequence.primary_nodes)
  end

  def compare_me # TODO: DELETE THIS! - RC
    sequence.as_json.deep_symbolize_keys.slice(:args, :kind, :body)
  end
end
