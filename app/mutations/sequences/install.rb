module Sequences
  # Installing a sequence version creates a new sequence on
  # the user's account.
  class Install < Mutations::Command
    NOT_PUBLISHED = "Can't install unpublished sequences"

    required do
      model :device, class: Device
      model :sequence_version, class: SequenceVersion
    end

    def validate
      validate_publication
    end

    def execute
      s = Sequence.create!(forked: false,
                           name: sequence_version.name,
                           color: sequence_version.color,
                           device: device,
                           sequence_version_id: sequence_version.id)
      sequence.broadcast!(SecureRandom.uuid)
      Sequences::Show.run!(sequence: s)
    end

    private

    def validate_publication
      unless sequence_version.sequence_publication.published
        add_error :sequence_version, :version, NOT_PUBLISHED
      end
    end
  end
end
