module Sequences
  module AstValidatorsInstanceMethods

    def validate_ast!
      run_ast_validations if body
    end

    def run_ast_validations
      result = Sequences::AstParser.run(body: body)
      errs = result.errors
      if errs && errs.any?
        errs.each do |err|
          add_error(:body, :body, err[1].message)
        end
      end
    end
  end

  module AstValidators
    def ast_body(optionality = :required) # Or "optional"
      self.include(AstValidatorsInstanceMethods)
      self.send(optionality) do
        array :body do
          hash do
              string :kind
              duck :args, methods: [:[], :[]=]
              string :comments, default: nil, nils: true
          end
        end
      end
    end
  end
end
