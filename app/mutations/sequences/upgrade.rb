module Sequences
  # Update an existing sequence on a user's account.
  class Upgrade < Mutations::Command
    NOT_YOURS = "Can't upgrade sequences you didn't create."
    NOT_PUBLISHED = "Can't install unpublished sequences"
    required do
      model :device, class: Device
      model :sequence, class: Sequence
      model :sequence_version, class: SequenceVersion
    end

    def validate
      validate_publication
      validate_ownership
    end

    def execute
      ActiveRecord::Base.transaction do
        update_sequence
        unfork
      end
      sequence.broadcast!(SecureRandom.uuid)
      Sequences::Show.run!(sequence: sequence)
    end

    private

    def update_sequence
      sequence.update!(forked: false,
                       name: maybe_upgrade(:name),
                       color: maybe_upgrade(:color),
                       description: sequence_version.description,
                       sequence_version_id: sequence_version.id)
    end

    # If the user previously forked the shared sequence,
    # we need to destroy the old data to save space since the
    # fork will no longer be used.
    def unfork
      PrimaryNode.where(sequence_id: sequence.id).destroy_all
      EdgeNode.where(sequence_id: sequence.id).destroy_all
    end

    # If a sequence is forked, we want to _NOT_ clobber
    # certain attributes when upgrading.
    # Example: Downstream user customized the name or color
    #          of their sequence.
    def maybe_upgrade(val)
      # If the sequence has never had an upstream sequence,
      # always use the upstream's value
      unless old_sequence_version
        return sequence_version[val]
      end

      current_attr = sequence[val]
      # If the sequence was forked, first compare the
      # upstream vs. downstream value.
      if current_attr == old_sequence_version[val]
        # The downstream value never changed;
        # use the new value.
        sequence_version[val]
      else
        # The downstream value was modified by the end user;
        # Only the end user can change the value moving
        # forward.
        current_attr
      end
    end

    def old_sequence_version
      @old_sequence_version ||= SequenceVersion
        .find_by(id: sequence.sequence_version_id)
    end

    def validate_ownership
      if sequence.device_id != device.id
        raise Errors::Forbidden, NOT_YOURS
      end
    end

    def validate_publication
      unless sequence_version.sequence_publication.published
        add_error :sequence_version, :version, NOT_PUBLISHED
      end
    end
  end
end
