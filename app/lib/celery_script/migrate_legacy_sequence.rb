module CeleryScript
  class MigrateLegacySequence < Mutations::Command
  # Any sequence that was `update_at` a time before this date must be upgraded.
  CUTOFF_DATE = DateTime.parse("2018-01-31 22:42:23 UTC")

  required do
    model :sequence, class: Sequence
  end

  def execute
    migrate! unless sequence.updated_at > CUTOFF_DATE
    sequence
  end

private

  def migrate!
    StoreCelery.run!(sequence: sequence)
  end
end
end