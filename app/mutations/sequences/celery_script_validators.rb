module Sequences
  module CeleryScriptValidators
    NO_TRANSACTION = "You need to do this in a transaction"
    RESOURCES      = { "tool_id"     => Tool,
                       "sequence_id" => Sequence }
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
      # TODO: The code below strips out unneeded attributes, or attributes that
      # are not part of CeleryScript. We're only stripping attributes out of the
      # first level, though. I would like to recursively strip out "noise" via
      # CeleryScript::JSONClimber. I am holding off for now in the name of time.
      (inputs[:body] || []).map! { |x| x.slice(*ALLOWED_NODE_KEYS) }
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
