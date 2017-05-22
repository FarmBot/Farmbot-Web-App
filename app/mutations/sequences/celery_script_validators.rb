module Sequences
  module CeleryScriptValidators
    include Skylight::Helpers

    NO_TRANSACTION   = "You need to do this in a transaction"
    ARGS_OF_INTEREST = { "tool_id"     => Tool,
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

    instrument_method
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
        SequenceDependency
          .where(sequence: sequence)
          .destroy_all

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

    # Climbs through every node in a sequence and finds out which dependencies
    # will need to be kept track of
    def deps(sequence)
      return [] unless checker.valid? # Exit early if it's bad data
      all = [] # Start collecting the list.
      CeleryScript::TreeClimber.travel(tree, ->(n) {
        # Iterate over each node, looking for "args of interest".
        # Tools, sub sequences, etc.
        ARGS_OF_INTEREST.map do |arg, klass|
          id = n&.args&.fetch(arg, nil)&.value
          all.push(klass.find(id)) if id
        end
      })

      # Filter out the target sequence to prevent runaway recursion.
      # It would be impossible to delete recursive sequences otherwise.
      all.select! { |d| !(d.is_a?(Sequence) && (d.id == sequence.id)) }

      # Finally, output the data in a format that can directly be used by
      # SequenceDependency#create!().
      return all.uniq.map do |d|
        { sequence: sequence, dependency_type: d.class, dependency_id: d.id }
      end
    end
  end
end
