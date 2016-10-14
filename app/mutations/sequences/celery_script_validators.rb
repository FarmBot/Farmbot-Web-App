module Sequences
  module CeleryScriptValidators
    def validate_sequence
        seq = {body: [],
                args: {},
                kind: "sequence"}.merge(inputs.symbolize_keys.slice(:body,
                                                                    :kind,
                                                                    :args))
        tree    = CeleryScript::AstNode.new(**seq)
        corpus  = Sequence::Corpus
        checker = CeleryScript::Checker.new(tree, corpus)
        add_error :body, :syntax_error, checker.error.message if !checker.valid?
    end
  end
end
