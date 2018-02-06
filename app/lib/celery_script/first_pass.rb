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
    B = CeleryScript::CSHeap::BODY
    K = CeleryScript::CSHeap::KIND
    L = CeleryScript::CSHeap::LINK
    N = CeleryScript::CSHeap::NEXT
    P = CeleryScript::CSHeap::PARENT

    required do
      model :sequence, class: Sequence
    end

    def execute
      flat_ir
        .each do |node|
          node[:instance] = PrimaryNode
            .create!(kind: node[K], sequence: sequence)
        end
        .map do |node|
          model = node[:instance]
          model.body_id   = fetch_sql_id_for(B,   node)
          model.parent_id = fetch_sql_id_for(P, node)
          model
        end
        .map do |model|
          # We do `.last` because many nodes have this node as a parent,
          # However, they might be args rather than true `next` body nodes.
          children      = flat_ir.select { |x| x[:instance].parent_id == model.id }
          next_child    = children.last
          model.next_id = next_child[:instance].id if next_child
        end

      primary_data = flat_ir
        .map {|x| x.without(*CeleryScript::CSHeap::PRIMARY_FIELDS, :instance)}
        .map {|x| x.to_a.select {|(key, val)| key.to_s.starts_with?(L)}.to_h }
        .map(&:invert)

      flat_ir
        .each_with_index do |node, flat_ir_index|
          maybe_primary_data = primary_data[node[P].to_i][flat_ir_index.to_s]
          node[:instance].parent_arg_name = maybe_primary_data.gsub(L, "") if maybe_primary_data
        end

      edge_data = flat_ir
        .map {|x| x.without(*CeleryScript::CSHeap::PRIMARY_FIELDS, :instance)}
        .map {|x| x.to_a.select {|(key, val)| !key.to_s.starts_with?(L)}.to_h }
        .map(&:invert)

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
      index = node[node_key].to_i
      flat_ir[index][:instance].id
    rescue => q
      binding.pry
    end

    def flat_ir
      @flat_ir ||= Slicer.new.run!(sequence.as_json.deep_symbolize_keys)
    end
  end
end
