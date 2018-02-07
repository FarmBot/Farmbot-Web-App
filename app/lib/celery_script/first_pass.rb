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
    B    = CeleryScript::CSHeap::BODY
    K    = CeleryScript::CSHeap::KIND
    L    = CeleryScript::CSHeap::LINK
    N    = CeleryScript::CSHeap::NEXT
    P    = CeleryScript::CSHeap::PARENT
    NULL = CeleryScript::CSHeap::NULL
    I    = :instance

    required do
      model :sequence, class: Sequence
    end

    def execute

      flat_ir
        .each do |node|
          # Step 1- instantiate records.
          node[I] = PrimaryNode.create!(kind: node[K], sequence: sequence)
        end
        .map do |node|
          # Step 2- Assign SQL ids (not to be confused with array index IDs or
          #         instances of HeapAddress)
          model           = node[I]
          model.body_id   = fetch_sql_id_for(B, node)
          model.parent_id = fetch_sql_id_for(P, node)
          model.next_id   = fetch_sql_id_for(N, node)
          node
        end
        .map do |node|
          # Step 3- Set edge nodes
          pairs = node
            .to_a
            .select do |x|
              key = x.first.to_s
              !key.starts_with?(L) && (x.first != I)
            end
            .map do |(key, value)|
              EdgeNode.create!(kind:            key,
                               value:           value,
                               sequence_id:     sequence.id,
                               primary_node_id: node[:instance].id)
            end
          node
        end
        .map do |node|
          # Step 3- Set parent_arg_name
          if ((node[N] == NULL) && (node[P] != NULL))
            binding.pry
          end
          node
        end

        puts "TODO: Set `next` to `nothing` if `body.kind === 'nothing'` "
      puts "TODO: Make sure primary nodes are all wired up."
      puts "TODO: Attach edge nodes to primary nodes"
      raise "DO NOT PROCEEEEDEEE"
      #   .each do |item|
      #   # Edge nodes are primitive values.
      #   # We can instantiate all EdgeNodes on the first pass easily.
      #   edge_nodes = item[:edge_nodes] # No longer used.
      #     .to_a
      #     .select do |(key, value)|
      #       key.to_s.start_with?(L)
      #     end
      #     .map do |(kind, value)|
      #       EdgeNode.new(kind: kind, value: value, sequence: sequence)
      #     end

      #   # Augment the flat IR array with a special "instance" field that will be
      #   # needed when we run the second pass (resolve parent/child nodes).
      #   # `I` represents a `PrimaryNode` that is missing information
      #   # which can only be resolved after all nodes have been processed.
      #   instance = PrimaryNode.new(kind:       item[:kind],
      #                              sequence:   sequence,
      #                              edge_nodes: edge_nodes)
      #   item[I] = instance
      # end
      # flat_ir
    end

private

    def fetch_sql_id_for(node_key, node)
      index = node[node_key].to_i
      flat_ir[index][I].id
    end

    def flat_ir
      @flat_ir ||= Slicer.new.run!(sequence.as_json.deep_symbolize_keys)
    end
  end
end
