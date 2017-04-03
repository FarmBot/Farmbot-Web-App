module Sequences
  class JustValidate < Mutations::Command
    include CeleryScriptValidators

    required do
      duck :body, methods: [:[], :[]=, :each, :map]
      string :name
      string :color, in: Sequence::COLORS
    end

    optional do
      model :device, class: Device
    end

    def validate
      validate_sequence
    end

    def execute
      seq
    end
  end
end
