module Sequences
  module CeleryScriptValidators

    NO_TRANSACTION   = "You need to do this in a transaction"
    ARGS_OF_INTEREST = {"tool_id"     => Tool,
                        "sequence_id" => Sequence,
                        "pointer_id"  => Point }
    ALLOWED_NODE_KEYS = [
      "body",
      "kind",
      "args",
      "comment",
      :body,
      :kind,
      :args,
      :comment
    ]

    def validate_sequence
      # The code below strips out unneeded attributes, or attributes that
      # are not part of CeleryScript. We're only stripping attributes out of the
      # first level, though. Because of how EdgeNode and PrimaryNode work,
      # superfluous attributes will disappear on save and that's OK.
      (inputs[:body] || []).map! { |x| x.slice(*ALLOWED_NODE_KEYS) }
      add_error :body, :syntax_error, checker.error.message if !checker.valid?
    end

    def symbolized_input
      @symbolized_input ||= inputs.symbolize_keys.slice(:body, :kind, :args)
    end

    def tree
      hmm  = {
        kind: "sequence",
        body: symbolized_input[:body],
        args: {
          version: Sequence::LATEST_VERSION,
          locals:  symbolized_input
            .deep_symbolize_keys
            .dig(:args, :locals) || Sequence::SCOPE_DECLARATION
        }
      }
      @tree = CeleryScript::AstNode.new(**hmm)
    end

    def corpus
      Sequence::Corpus
    end

    def checker
      @checker = CeleryScript::Checker.new(tree, corpus, device)
    end
  end
end
