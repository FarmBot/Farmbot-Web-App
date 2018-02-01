# Service object that:
# 1. Pulls out all PrimaryNodes and EdgeNodes for a sequence node (AST Flat IR form)
# 2. Stitches the nodes back together in their "canonical" (nested) AST
#    representation
module CeleryScript
class FetchCelery < Mutations::Command
private  # = = = = = = =

  # Returns an `EdgeNode` or `nil` for the following situations:
  #   1. The first element of a node's `body` attribute
  #   2. (when already inside of a body array) The next `body` element in the chain.
  #   3. (when the node has no body) nil
  #   3. (when at the end of the body chain) nil
  def get_child(node) # => EdgeNode | nil
    children = primary_nodes.by.parent_id[node.id]
    return children ?
      children.find { |x| !x.parent_arg_name && x.kind != "nothing" } : nil
  end

  # This class is too CPU intensive to make multiple SQL requests.
  # To speed up querying, we create an in-memory index for frequently
  # looked up attributes such as :id, :kind, :parent_id, :primary_node_id
  def edge_nodes
    @edge_nodes ||= Indexer.new(sequence.edge_nodes)
  end

  # See docs for #edge_nodes()
  def primary_nodes
    @primary_nodes ||= Indexer.new(sequence.primary_nodes)
  end

  # Helper function for frequently references object. All nodes that point to
  # this node as their `parent_id` or `child_id` indicate a `nil` condition.
  def null_node
    @null_node ||= primary_nodes.by.id[entry_node.parent_id].first
  end

  # The topmost node (kind == "sequence") in a sequence.
  def entry_node
    @entry_node ||= primary_nodes.by.kind["sequence"].first
  end

  # Mutates "args" property to add all relevant edge ("e") nodes.
  def add_e_nodes(arg_hash, node_array)
    node_array.map { |node| arg_hash[node.kind] = node.value }
  end

  # Mutates "args" property to add all relevant primary ("p") nodes.
  def add_p_nodes(arg_hash, node_array)
    node_array.map do |node|
      key = node.parent_arg_name
      key && arg_hash[key] = recurse_into_node(node)
    end
  end

  # Mutate an array to contain all the body items of the `origin` node
  # Turns a linked list into a JSON array. Returns Array or nil
  def recurse_into_body(origin, output_array = [])
    # How do I detect if I should pass `output_array` or instantiate a new copy?
    child = get_child(origin)
    child && output_array.push(recurse_into_node(child))
    return output_array.empty? ? nil : output_array
  end

  # Given a `node` object, creates the appropriate JSON representation of
  # node.args based on relational IDs.
  def recurse_into_args(node)
    result  = {}
    add_p_nodes(result, primary_nodes.by.parent_id[node.id] || [])
    add_e_nodes(result, edge_nodes.by.primary_node_id[node.id] || [])
    result
  end

  # Top level function call for converting a single EdgeNode into a JSON
  # document. Returns Hash<Symbol, any>
  def recurse_into_node(node)
    output = { kind: node.kind, args: recurse_into_args(node) }
    body = recurse_into_body(node, [])
    output[:body] = body if body

    return output
  end

  public # = = = = = = =
  required do
    model :sequence, class: Sequence
  end

  def validate
    if !primary_nodes.by.kind["sequence"]
      add_error :bad_sequence,
      :bad,
      "You must have a root node `sequence` at a minimum."
    end
  end

  def execute
    return recurse_into_node(entry_node)
      .deep_symbolize_keys
  end

end
end