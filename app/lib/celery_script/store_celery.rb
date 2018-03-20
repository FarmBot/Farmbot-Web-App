# API users hand us sequences as a JSON object with CeleryScript nodes nested
# within other nodes. We call this the "canonical representation". It's easy to
# traverse over, but tree structures are not well suited to the app's storage
# mechanism (SQL).
# To get around the limitation, we must convert sequence JSON from canonical to
# flat forms. `StoreCelery` handles the conversion and storage of CS Nodes.
module CeleryScript
  class StoreCelery < Mutations::Command
    using Sequences::CanonicalCeleryHelpers

    required do
      model :sequence, class: Sequence
      body
      args
    end

    def execute
      Sequence.transaction do
        sequence.primary_nodes.destroy_all
        sequence.edge_nodes.destroy_all
        FirstPass.run!(sequence: sequence, body: body, args: args)
        sequence.reload
      end
    end
  end
end
