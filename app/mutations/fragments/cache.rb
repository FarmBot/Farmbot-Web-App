  class Cache # CeleryScript Fragment cache, not the other kind.
    def initialize(fragment)
      @fragment               = fragment
      @nodes_by_id            = fragment.nodes.index_by(&:id)
      @arg_set_by_node_id     = fragment.arg_sets.index_by(&:node_id)
      @primitive_by_id        = fragment.primitives.index_by(&:id)
      @pri_pair_by_arg_set_id = fragment.primitive_pairs.group_by(&:arg_set_id)
      @std_pair_by_arg_set_id = fragment.standard_pairs.group_by(&:arg_set_id)
    end

    def get_primitive_pairs(node) # Return Hash<string, number|boolean|string>
      arg_set = @arg_set_by_node_id.fetch(node.id)
      @pri_pair_by_arg_set_id
        .fetch(arg_set.id, [])
        .map do |x|
          [ArgName.cached_by_id(x.arg_name_id).value,
           @primitive_by_id.fetch(x.primitive_id).value]
        end
        .to_h
    end

    # node.arg_set.standard_pairs
    def get_standard_pairs(node)
      arg_set = @arg_set_by_node_id.fetch(node.id)
      @std_pair_by_arg_set_id
        .fetch(arg_set.id, [])
        .map do |x|
          [ArgName.cached_by_id(x.arg_name_id).value,
           @nodes_by_id.fetch(x.node_id)]
        end
    end

    # node.body
    def get_body(node)
      @nodes_by_id.fetch(node.body_id)
    end

    # node.kind.value
    def get_next(node)
      @nodes_by_id.fetch(node.next_id)
    end

    # node.kind
    def kind(node)
      Kind.cached_by_id(node.kind_id)
    end
  end
