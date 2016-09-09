module Sequences
  class Update < Mutations::Command

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
      add_error(:steps, :empty, "Can't be blank") if steps == []
      raise Errors::Forbidden unless sequence.device.users.include?(user)
    end

    def execute
      ActiveRecord::Base.transaction do
        sequence.steps.destroy_all if inputs[:steps].present?
        Array(inputs[:steps]).map!(&:as_json)
        .map!(&:deep_symbolize_keys)
        .map! do |ri|
          Step.new(ri.except(:id, :sequence_id)).tap{ |r| r.validate! }
        end

        sequence.update_attributes!(inputs.slice(:name, :color, :steps))
      end

      sequence

      rescue ActiveRecord::RecordInvalid => e
        binding.pry
        offender = e.record.as_json.slice("message_type", "position").to_s
        add_error :steps,
                :probably_bad,
                "Failed to instantiate nested step. Offending item: " + offender
    end
  end
end
