module Fragments
  class Show < Mutations::Command
    ENTRY    = "internal_entry_point"
    required do
      integer :fragment_id
      model :device, class: Device
    end

    def validate
    end

    def execute
      node2cs(entry_node.next)
    end

  private

    def node2cs(node)
      standard  = node.arg_set.standard_pairs.reduce({}) do |acc, item|
        acc[item.arg_name.value] = node2cs(item.node)
        acc
      end

      primitive = node.arg_set.primitive_pairs.reduce({}) do |acc, item|
        acc[item.arg_name.value] = item.primitive.value
        acc
      end

      result = { kind: node.kind.value,
                 args: primitive.merge(standard),
                 body: recurse_into_body(node.body) }
      result.delete(:body) if result[:body].length == 0
      result
    end

    def recurse_into_body(node, body = [])
      unless [Kind.nothing, Kind.entry_point].include?(node.kind)
        body.push(node2cs(node))
        recurse_into_body(node.next, body)
      else
        body
      end
    end

    def entry_node
      # .preload(Fragment::EVERYTHING)
      @entry_node ||= fragment.nodes.preload(Node::EVERYTHING).find_by(kind: Kind.cached_by_value(ENTRY))
    end

    def node_index
      @node_index ||= fragment.nodes.index_by(&:id)
    end

    def fragment
      @fragment ||= device
        .fragments
        .preload(Fragment::EVERYTHING)
        .find(fragment_id)
    end
  end
end
