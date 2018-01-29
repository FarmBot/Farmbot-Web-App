# API users hand us sequences as a JSON object with CeleryScript nodes nested
# within other nodes. We call this the "canonical representation". It's easy to
# traverse over, but tree structures are not well suited to the app's storage
# mechanism (SQL).
# To get around the limitation, we must convert sequence JSON from canonical to
# flat forms. `StoreCelery` handles the conversion and storage of CS Nodes.
class StoreCelery < Mutations::Command
  required do
    model :sequence, class: Sequence
  end

  def execute
    Sequence.transaction do
      sequence.primary_nodes.destroy_all
      sequence.edge_nodes.destroy_all
      first_pass  = FirstPass.run!(input:  flat_ir, sequence: sequence)
      second_pass = SecondPass.run!(input: first_pass)
      second_pass.map(&:save!)
    end
  end

private

  def flat_ir
    @flat_ir ||= Slicer.new.run!(sequence.as_json.deep_symbolize_keys)
  end
end
