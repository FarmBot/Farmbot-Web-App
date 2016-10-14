module Sequences
  class Create < Mutations::Command
    include CeleryScriptValidators
    required do
      model :device, class: Device
      string :name
      duck :body, methods: [:[], :[]=, :each, :map]
    end

    optional do
      string :color, in: Sequence::COLORS
    end

    def validate
      validate_sequence
      update_sequence_dependencies
    end

    def execute
      Sequence.create!(inputs)  
    end
  end
end
