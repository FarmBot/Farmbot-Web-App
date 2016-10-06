module Sequences
  class AstValidation < Mutations::Command

    required do
      array :body do
        hash do
          string :kind, in: Sequence::NODE_KINDS
          duck :args, methods: [:[], :[]=]
        end
      end
    end

    def execute
      binding.pry  
    end
  end
end
