class StoreCelery < Mutations::Command
  required do
    model :sequence, class: Sequence
  end

  def execute
    Sequence.transaction do
      sequence.sequence_nodes.destroy_all
      sequence.leaves.destroy_all
      flat_ir.map { |x| binding.pry }
    end
  end

private

  def flat_ir
    @flat_ir ||= Slicer.new.run!(sequence.as_json)
  end
end
