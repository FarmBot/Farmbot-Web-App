module Sequences
  # Installing a sequence version creates a new sequence on
  # the user's account.
  class Install < Mutations::Command
    include CeleryScriptValidators
    NOT_PUBLISHED = "Can't install unpublished sequences"

    required do
      model :device, class: Device
      model :sequence_version, class: SequenceVersion
    end

    def validate
      validate_publication
      validate_sequence_count
    end

    def execute
      Sequence.transaction do
        s = Sequence.find_or_create_by!(
          name: sequence_version.name,
          device: device,
          sequence_version_id: sequence_version.id,
        )
        s.update!(forked: false,
                  color: sequence_version.color,
                  description: nil)
        s.broadcast!(SecureRandom.uuid)
        Sequences::Show.run!(sequence: s)
      end
    end

    private

    def validate_publication
      unless sequence_version.sequence_publication.published
        add_error :sequence_version, :version, NOT_PUBLISHED
      end
    end
  end
end
