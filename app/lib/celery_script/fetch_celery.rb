require_relative "./csheap"

# Service object that:
# 1. Pulls out all PrimaryNodes and EdgeNodes for a sequence node (AST Flat IR form)
# 2. Stitches the nodes back together in their "canonical" (nested) AST
#    representation
module CeleryScript
  class FetchCelery < Mutations::Command
  private  # = = = = = = =
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
      results   = []
      until next_node.kind == "nothing"
        results.push(next_node)
        next_node = find_by_id_in_memory(next_node[:next_id])
      end
      results
    end

    # Top level function call for converting a single EdgeNode into a JSON
    # document. Returns Ruby hash that conforms to CeleryScript semantics.
    def recurse_into_node(node)
      out  = { kind: node.kind, args: recurse_into_args(node) }
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

    # Generates a hash that has all the other fields that API users expect,
    # Eg: color, id, etc.
    def misc_fields
      return {
        id:         sequence.id,
        name:       sequence.name,
        color:      sequence.color,
        created_at: sequence.created_at,
        updated_at: sequence.updated_at,
        args:       Sequence::DEFAULT_ARGS.merge({ is_outdated: false })
      }
    end

  public # = = = = = = =
    NO_SEQUENCE = "You must have a root node `sequence` at a minimum."

    required do
      model :sequence, class: Sequence
    end

    def validate
      sequence.reload
      # A sequence lacking a `sequence` node is a syntax error.
      # This should never show up in the frontend, but *is* helpful for devs
      # when debugging.
      add_error :bad_sequence, :bad, NO_SEQUENCE unless entry_node
    end

    def execute
      canonical_form = misc_fields.merge!(recurse_into_node(entry_node))
      return HashWithIndifferentAccess.new(canonical_form)
    end
  end
end
