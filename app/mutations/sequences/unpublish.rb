module Sequences
  class Unpublish < Mutations::Command
    NOT_YOURS = "Can't unpublish sequences you didn't create."

    required do
      model :device, class: Device
      model :sequence, class: Sequence
    end

    def validate
      validate_ownership
    end

    def execute
      SequencePublication.transaction do
        publication
          .sequence_versions
          .where(withdrawn_at: nil)
          .update_all(withdrawn_at: Time.current)
        publication.update!(published: false)
      end
      sequence.broadcast!(SecureRandom.uuid)
      publication
    end

    private

    def publication
      @publication ||=
        SequencePublication.find_by!(author_sequence_id: sequence.id,
                                     author_device_id: device.id)
    end

    def validate_ownership
      if sequence.device_id != device.id
        raise Errors::Forbidden, NOT_YOURS
      end
    end
  end
end
