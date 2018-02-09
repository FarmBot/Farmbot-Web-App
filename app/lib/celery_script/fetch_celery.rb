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
      @edge_nodes ||= Indexer.new(EdgeNode.where(sequence: sequence))
    end

    # See docs for #edge_nodes()
    def primary_nodes
      @primary_nodes ||= Indexer.new(PrimaryNode.where(sequence: sequence))
    end

    def find_node(id) # Use `next_id`, `id`, `body_id`, `parent_id`
      return (primary_nodes.by.id[id] || [])
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
      @entry_node ||= primary_nodes.by.kind["sequence"].try(:first)
    end

    def attach_edges(node)
      output = {}
      (edge_nodes.by.primary_node_id[node.id] || [])
        .map { |edge| output[edge.kind] = edge.value }
      output
    end

    def attach_primary_nodes(node)
      output = {}
      (primary_nodes.by.parent_id[node.id] || []).select(&:parent_arg_name)
        .map { |x| output[x.parent_arg_name] = recurse_into_node(x) }
      output
    end

    def recurse_into_args(node)
      {}.merge!(attach_edges(node)).merge!(attach_primary_nodes(node))
    end

    def get_body_elements(node)
      next_node = node.body
      results = []
      until next_node.kind == "nothing"
        results.push(next_node)
        next_node = next_node.next
      end
      results
    end

    # Top level function call for converting a single EdgeNode into a JSON
    # document. Returns Hash<Symbol, any>
    def recurse_into_node(node)
      out  = { kind: node.kind, args: recurse_into_args(node) }
      body = get_body_elements(node)
      out[:body] = body.map { |x| recurse_into_node(x) } unless body.empty?
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
        updated_at: sequence.updated_at,
        args:       { is_outdated: false }
      }
    end

  public # = = = = = = =
    NO_SEQUENCE = "You must have a root node `sequence` at a minimum."

    required do
      model :sequence, class: Sequence
    end

    def validate
      CeleryScript::StoreCelery
        .run!(sequence: sequence) unless sequence.migrated_nodes
      add_error :bad_sequence, :bad, NO_SEQUENCE unless entry_node
    end

    def execute
      return HashWithIndifferentAccess
        .new(misc_fields.merge!(recurse_into_node(entry_node)))
    end
  end
end