module Sequences
  class Update < Mutations::Command
    using MongoidRefinements

    required do
      model :user, class: User
      model :sequence, class: Sequence
    end

    optional do
      string :name
      string :color, in: Sequence::COLORS
      array :steps
    end

    def validate
      read_users_mind
      raise Errors::Forbidden unless sequence.device.users.include?(user)
    end

    def execute
      update_attributes(sequence, inputs.except(:user, :sequence, :_id))
    end

    def read_users_mind
      case steps
      when nil
        # User doesn't want to touch the steps.
        nil
      when []
        # User wants to empty the step list
        # This is not legal, but we let it pass through for the sake of
        # generating coherent, readable errors
        add_error(:steps, :empty, "Can't be blank")
      else
        nil
      end
    end
  end
end
