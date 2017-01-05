module Sequences
  module CeleryScriptValidators
    NO_TRANSACTION = "You need to do this in a transaction"
    RESOURCES      = { "tool_id"     => Tool,
                       "sequence_id" => Sequence }
    def validate_sequence
        add_error :body, :syntax_error, checker.error.message if !checker.valid?
    end

    def seq
      @seq ||= {body: [],
                args: { version: SequenceMigration::Base.latest_version },
                kind: "sequence"}.merge(inputs.symbolize_keys.slice(:body,
                                                                    :kind,
                                                                    :args))
    end

    def reload_dependencies(sequence)
        must_be_in_transaction
        SequenceDependency.where(sequence: sequence).destroy_all
        SequenceDependency.create!(deps(sequence))
    end

    def must_be_in_transaction
      count = ActiveRecord::Base.connection.open_transactions
      raise NO_TRANSACTION if count < 1
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

    def deps(sequence)
      all = []
      return all unless checker.valid?

      cb = ->(n) {
          RESOURCES.map do |arg, klass|
            id = n&.args&.fetch(arg, nil)&.value
            all.push(sequence: sequence,
                      dependency_type: klass,
                      dependency_id: id) if id
          end
      }
      # Filter out the target sequence to prevent runaway recursion.
      all.select do |r|
        !(r[dependency_type] == Sequence && r[dependency_id] == sequence.id)
      end

      CeleryScript::TreeClimber.travel(tree, cb)
      all
    end
  end
end
