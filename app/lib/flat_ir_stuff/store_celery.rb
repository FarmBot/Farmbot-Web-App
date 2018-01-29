class StoreCelery < Mutations::Command
  required do
    model :sequence, class: Sequence
  end

  def execute
    Sequence.transaction do
      sequence.primary_nodes.destroy_all
      sequence.edge_nodes.destroy_all
      second_pass(first_pass(flat_ir)).map(&:save!)
    end
  end

private

  def flat_ir
    @flat_ir ||= Slicer.new.run!(sequence.as_json.deep_symbolize_keys)
  end

  def first_pass(ir)
    ir.each do |item|
      edge_nodes = item[:edge_nodes].to_a.map do |(kind, value)|
        EdgeNode.new(kind: kind, value: value, sequence: sequence)
      end
      item[:instance] = PrimaryNode
        .new(kind: item[:kind], sequence: sequence, edge_nodes: edge_nodes)
    end
  end

  # Operates on a flat_ir that has been augmented with an :instance
  # (PrimaryNode) key.
  def second_pass(nodes)
    nodes.map do |node|
      parent_index, child_index = node.slice(:parent, :child).values
      node[:instance].parent = nodes[parent_index][:instance] if parent_index != 0
      node[:instance].child = nodes[child_index][:instance] if child_index != 0
      node[:primary_nodes]
        .to_a
        .map do |(parent_arg_name, arg_index)|
          i = nodes[arg_index][:instance]
          i.parent_arg_name = parent_arg_name
        end
      node[:instance]
    end
  end
end
