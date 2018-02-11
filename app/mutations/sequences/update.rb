module Sequences
  class Update < Mutations::Command
    include CeleryScriptValidators
    UNKNOWN = "Unknown validation issues."
    required do
      model :device, class: Device
      model :sequence, class: Sequence
    end

    optional do
      duck :body, methods: [:[], :[]=, :each, :map]
      string :name
      string :color, in: Sequence::COLORS
      hash :args do
        optional do
          hash :locals do
            duck :*, methods: [] # Let CeleryScript lib do the type checking...
          end
        end
      end
    end

    def validate
      validate_sequence
      raise Errors::Forbidden unless device.sequences.include?(sequence)
    end

    def execute
      ActiveRecord::Base.transaction do
        sequence.args["is_outdated"] = false
        sequence.migrated_nodes = true
        sequence.update_attributes!(inputs.except(:sequence, :device))
        CeleryScript::StoreCelery.run!(sequence: sequence)
      end
      CeleryScript::FetchCelery.run!(sequence: sequence.reload)
    rescue ActiveRecord::RecordInvalid => e
      add_error :other, :unknown, (e.try(:message) || UNKNOWN)
    end
  end
end
