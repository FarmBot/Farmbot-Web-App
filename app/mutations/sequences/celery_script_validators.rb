module Sequences
  module CeleryScriptValidators
    def validate_sequence
        add_error :body, :syntax_error, checker.error.message if !checker.valid?
    end

    def seq
      @seq ||= {body: [],
                args: { tag_version: 0 },
                kind: "sequence"}.merge(inputs.symbolize_keys.slice(:body,
                                                                    :kind,
                                                                    :args))
    end

    def reload_dependencies(sequence)
        must_be_in_transaction
        SequenceDependency.where(sequence: sequence).destroy_all
        list_of_items = sub_sequences
        .select { |ss| sequence.id != ss } # Avoid recursive dependency creation
        .map do |id|
          {sequence: sequence,
           dependency_type: Sequence,
           dependency_id: id}
        end
        SequenceDependency.create!(list_of_items)
    end

    def must_be_in_transaction
      count = ActiveRecord::Base.connection.open_transactions
      raise "You need to do this in a transaction" if count < 1
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

    def sub_sequences
      all = []
      return all unless checker.valid?
      cb = ->(n) {
          # Try to acess n.args["sub_sequence_id"].value (if any)
          ssid = n&.args&.fetch("sub_sequence_id", nil)&.value
          # Collect result if found
          all.push(ssid) if ssid
      }
      CeleryScript::TreeClimber.travel(tree, cb)
      all
    end
  end
end
