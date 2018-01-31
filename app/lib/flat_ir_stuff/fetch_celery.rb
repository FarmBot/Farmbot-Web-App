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
    build_sequence!.tap{ |x| binding.pry }
  end

private

  def build_sequence!
    return recurse_into_node(entry_node)
  end

  # All nodes that point to this node as their `parent_id` or `child_id`
  # indicate a `nil` condition, but without using falsyness.
  def null_node
    @null_node ||= primary_nodes.by.id[entry_node.parent_id]
  end

  # The topmost node in a sequence.
  def entry_node
    @entry_node ||= primary_nodes.by.kind["sequence"]
  end

  def recurse_into_node(node)
    raise "no" unless node.is_a?(PrimaryNode)
    child = primary_nodes.by.id[node.child_id]
    output = {
      kind: node.kind,
      args: recurse_into_args(node),
    }
    output[:body] = recurse_into_body(node) unless child == null_node
    return output
  end

  def recurse_into_args(node)
    result  = {}
    add_p_nodes(result, primary_nodes.by.parent_id[node.id])
    add_e_nodes(result, edge_nodes.by.primary_node_id[node.id])
    result
  end

  def add_e_nodes(arg_hash, node_or_array)
    Array(node_or_array).map do |node|
      arg_hash[node.kind] = node.value
    end
  end

  def add_p_nodes(arg_hash, node_or_array)
    Array(node_or_array).map do |node|
      if node.parent_arg_name
        key = node.parent_arg_name
        arg_hash[key] = recurse_into_node(node)
      else
        puts "SKIPPING " + node.kind
      end
    end
  end

  def recurse_into_body(node, body_nodes = [], parent_id = node.parent_id)
    binding.pry
    next_item = primary_nodes.by.parent_id[node.child_id]

    if next_item != null_node
      wow = recurse_into_node(next_item)
      body_nodes.push(wow)
      recurse_into_body(next_item, body_nodes, parent_id)
    end

    body_nodes
  end

  def edge_nodes
    @edge_nodes    ||= Indexer.new(sequence.edge_nodes)
  end

  def primary_nodes
    @primary_nodes ||= Indexer.new(sequence.primary_nodes)
  end

  def compare_me # TODO: DELETE THIS! - RC
    sequence.as_json.deep_symbolize_keys
  end
end
