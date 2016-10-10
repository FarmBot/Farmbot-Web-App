module Sequences
  class Create < Mutations::Command
    extend AstValidators
    ast_body :optional

    required do
      model :device, class: Device
      string :name
    end

    optional do
      string :color, in: Sequence::COLORS
    end

    def execute
      validate_ast!
      Sequence.create!(inputs)  
    end
  end
end
