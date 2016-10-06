module Sequences
  class Update < Mutations::Command

    required do
      model :user, class: User
      model :sequence, class: Sequence
    end

    optional do
      string :name
      string :color, in: Sequence::COLORS
    end

    def validate
      raise Errors::Forbidden unless sequence.device.users.include?(user)
    end

    def execute
      sequence

      rescue ActiveRecord::RecordInvalid => e
        case e.record
        when Sequence
          bad_sequence(e)
        else
          add_error :other, :unknown, (e.try(:message) || "Unknown validation issues.")
        end
    end

    def bad_sequence(e)
      add_error :sequence, :not_valid, e.message
    end
  end
end
