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

    def find_node(id) # Use `next_id`, `id`, `body_id`, `parent_id`
      return primary_nodes
        .by
        .id[id]
        .select{|x| x.kind != "nothing"}
        .first
    end

    # Helper function for frequently references object. All nodes that point to
    # this node as their `parent_id` or `body_id` indicate a `nil` condition.
    def null_node
      @null_node ||= primary_nodes.by.id[entry_node.parent_id].first
    end

    # The topmost node (kind == "sequence") in a sequence.
    def entry_node
      @entry_node ||= primary_nodes.by.kind["sequence"].first
    end

    def recurse_into_args(node)
      puts "FIXME!"
      node
    end

    def get_body_elements(node)
      topmost = find_node(node.body_id)
      body = []
      if topmost # Start at head, if any.
        body.push(topmost)
        next_element = topmost
        while next_element # Recurse down till you hit the tail
          next_element = find_node(next_element.next_id)
          next_element && body.push(next_element)
        end
      end
      return body
    end

    # Top level function call for converting a single EdgeNode into a JSON
    # document. Returns Hash<Symbol, any>
    def recurse_into_node(node)
      out  = { kind: node.kind, args: recurse_into_args(node) }
      body = get_body_elements(node)
      out[:body] = body.map { |x| recurse_into_node(x) }
      return out
    end

    # Generates a hash that has all the other fields that API users expect,
    # Eg: color, id, etc
    def misc_fields
      return {
        id:         sequence.id,
        name:       sequence.name,
        color:      sequence.color,
        created_at: sequence.created_at,
        updated_at: sequence.updated_at
      }
    end

  public # = = = = = = =

    required do
      model :sequence, class: Sequence
    end

    def validate
      MigrateLegacySequence.run!(sequence: sequence)
      if !primary_nodes.by.kind["sequence"]
        add_error :bad_sequence,
        :bad,
        "You must have a root node `sequence` at a minimum."
      end
    end

    def execute
      return misc_fields.merge!(recurse_into_node(entry_node)).deep_symbolize_keys
    end
  end
end