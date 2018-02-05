module CeleryScript
  class MigrateLegacySequence < Mutations::Command

    required do
      model :sequence, class: Sequence
    end

    def execute
      if !sequence.migrated_nodes
        migrate!
        sequence.update_attributes!(migrated_nodes: true)
        sequence.reload
      end
      sequence
    end

  private

    def migrate!
      StoreCelery.run!(sequence: sequence)
    end
  end
end