module Sequences
  module CeleryScriptValidators
    def validate_sequence
        add_error :body, :syntax_error, checker.error.message if !checker.valid?
    end

    def update_sequence_dependencies
      puts "Write tests first!!!"
    end

    def seq
      @seq ||= {body: [],
                args: {},
                kind: "sequence"}.merge(inputs.symbolize_keys.slice(:body,
                                                                    :kind,
                                                                    :args))
    end

    def tree
      @tree = CeleryScript::AstNode.new(**seq)
    end

    def corpus
      Sequence::Corpus
    end

    def checker
      @checker = CeleryScript::Checker.new(tree, corpus)
    end
  end
end
