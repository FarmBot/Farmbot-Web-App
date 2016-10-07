module AstValidators
  def ast_body(optionality = :required) # Or "optional"
    self.send(optionality) do
      array :body do
        hash do
            string :kind, in: Sequence::NODE_KINDS
            duck :args, methods: [:[], :[]=]
            string :comments, default: nil
        end
      end
    end
  end
end