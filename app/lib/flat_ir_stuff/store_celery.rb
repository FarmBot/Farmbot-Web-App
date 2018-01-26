class StoreCelery < Mutations::Command
  required do
    model :sequence, class: Sequence
  end

  def execute
    Sequence.transaction do
      sequence.primary_nodes.destroy_all
      sequence.edge_nodes.destroy_all
      flat_ir
        .reverse
        .map do |node|
          # STEP 1: Create a PrimaryNode for each step
          # PrimaryNode.create!(sequence: sequence,)
          # STEP 2: Create relevant SecondaryNodes
        end
    end
  end

private

  def flat_ir
    @flat_ir ||= Slicer.new.run!(sequence.as_json.deep_symbolize_keys)
  end
end
