module Sequences
  # My goal is to eventually deprecate the EdgeNode/PrimaryNode tables
  # and instead use the `Fragment` model.
  # The class below attempts to keep the legacy code in one clean,
  # easy-to-delete location.
  # Try not to expand use o this class, OK?
  # -RC
  class LegacyRenderer
    attr_reader :sequence

    def initialize(sequence)
      @sequence = sequence
    end

    def run
      recurse_into_node(entry_node)
    end

    # = = = = = = =
    # This class is too CPU intensive to make multiple SQL requests.
    # To speed up querying, we create an in-memory index for frequently
    # looked up attributes such as :id, :kind, :parent_id, :primary_node_id
    def edge_nodes
      @edge_nodes ||= CeleryScript::Indexer.new(sequence.edge_nodes)
    end

    # See docs for #edge_nodes()
    def primary_nodes
      @primary_nodes ||= CeleryScript::Indexer.new(sequence.primary_nodes)
    end

    # The topmost node is always `NOTHING`. The term "root node" refers to
    # the node where (kind == "sequence") in a tree of nodes. We start recursion
    # here and move down.
    def entry_node
      @entry_node ||= primary_nodes.by.kind["sequence"].try(:first)
    end

    # Create a hash and attach all the EdgeNodes to it. Creates a partial "args"
    # property when converting from flat IR to canonical form.
    # Does not attach primary (fully formed CeleryScript) nodes.
    def attach_edges(node)
      output = {}
      (edge_nodes.by.primary_node_id[node.id] || [])
                                         .map { |edge| output[edge.kind] = edge.value }
      output
    end

    # Similar to attach_edges(node) but for fully formed CS nodes.
    # Eg: Will attach a `coordinate` node to a `location` arg.
    def attach_primary_nodes(node)
      output = {}
      (primary_nodes.by.parent_id[node.id] || []).select(&:parent_arg_name)
                                      .map { |x| output[x.parent_arg_name] = recurse_into_node(x) }
      output
    end

    def recurse_into_args(node)
      {}.merge!(attach_edges(node)).merge!(attach_primary_nodes(node))
    end

    # If you don't do this in memory, you will get N+1s all over the place - RC
    def find_by_id_in_memory(the_id)
      primary_nodes.by.id[the_id].first
    end

    # Pass this method a PrimaryNode and it will return an array filled with
    # that node's children (or an empty array, since body is always optional).
    def get_body_elements(origin)
      next_node = find_by_id_in_memory(origin.body_id)
      results = []
      until next_node.kind == "nothing"
        results.push(next_node)
        next_node = find_by_id_in_memory(next_node[:next_id])
      end
      results
    end

    # Top level function call for converting a single EdgeNode into a JSON
    # document. Returns Ruby hash that conforms to CeleryScript semantics.
    def recurse_into_node(node)
      out = { kind: node.kind, args: recurse_into_args(node) }
      body = get_body_elements(node)
      if body.empty?
        # Legacy sequences *must* have body on sequence. Others are fine.
        out[:body] = [] if node.kind == "sequence"
      else
        out[:body] = body.map { |x| recurse_into_node(x) }
      end
      out[:comment] = node.comment if node.comment
      return out
    end
  end
end
