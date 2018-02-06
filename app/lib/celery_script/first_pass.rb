# PROBLEM:
#   The CeleryScript flat IR representation makes "forward refrences" to parts
#   of the AST that have yet to be read.
#
# SOLUTION:
#   Break the conversion down into two "passes". The first pass will create all
#   relevant nodes that can be instantiated without forward references.
#   Remaining nodes are created in the `SecondPass` phase.
module CeleryScript
  class FirstPass < Mutations::Command
    required do
      model :sequence, class: Sequence
    end

    def execute
      flat_ir
        .each do |node|
          node[:instance] = PrimaryNode
            .create!(kind: node[CeleryScript::CSHeap::KIND], sequence: sequence)
        end
        .map do |node|
          model = node[:instance]
          model.body_id   = fetch_sql_id_for(CeleryScript::CSHeap::BODY,   node)
          model.parent_id = fetch_sql_id_for(CeleryScript::CSHeap::PARENT, node)
          model
        end
        .map do |model|
          # We do `.last` because many nodes have this node as a parent,
          # However, they might be args rather than true `next` body nodes.
          children = flat_ir.select { |x| x[:instance].parent_id == model.id }
          model.next_id   = children.last[:instance].id
          binding.pry

          # model.parent_arg_name = flat_ir[node[CeleryScript::CSHeap::BODY]]
        end
      #   .each do |item|
      #   # Edge nodes are primitive values.
      #   # We can instantiate all EdgeNodes on the first pass easily.
      #   edge_nodes = item[:edge_nodes] # No longer used.
      #     .to_a
      #     .select do |(key, value)|
      #       key.to_s.start_with?(CeleryScript::CSHeap::LINK)
      #     end
      #     .tap{ |x| binding.pry if x.present? }
      #     .map do |(kind, value)|
      #       EdgeNode.new(kind: kind, value: value, sequence: sequence)
      #     end

      #   # Augment the flat IR array with a special "instance" field that will be
      #   # needed when we run the second pass (resolve parent/child nodes).
      #   # `:instance` represents a `PrimaryNode` that is missing information
      #   # which can only be resolved after all nodes have been processed.
      #   instance = PrimaryNode.new(kind:       item[:kind],
      #                              sequence:   sequence,
      #                              edge_nodes: edge_nodes)
      #   item[:instance] = instance
      # end
      # flat_ir
    end

private

    def fetch_sql_id_for(node_key, node)
      flat_ir[node[node_key].to_i][:instance].id
    end

    def flat_ir
      @flat_ir ||= Slicer.new.run!(sequence.as_json.deep_symbolize_keys)
    end
  end
end
