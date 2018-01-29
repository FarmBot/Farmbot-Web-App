class StoreCelery < Mutations::Command
  required do
    model :sequence, class: Sequence
  end

  def execute
    Sequence.transaction do
      sequence.primary_nodes.destroy_all
      sequence.edge_nodes.destroy_all
      x = flat_ir
      binding.pry if x.length > 3
      # TODO:
      # FIRST PASS:  Instantiate PrimaryNodes
      # SECOND PASS: Instantiate EdgeNodes
      # THIRD PASS:  Set `parent_arg_name` and `parent` as needed.
    end
  end

private

  def flat_ir
    @flat_ir ||= Slicer.new.run!(sequence.as_json.deep_symbolize_keys)
  end
end
