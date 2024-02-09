module Sequences
  module CeleryScriptValidators
    NO_REGIMENS = "Cant add parent to sequence used by regimen (yet)"
    NO_TRANSACTION = "You need to do this in a transaction"
    TOO_MANY_SEQUENCES = "Your account has %s sequences. " \
      "The maximum allowed is %s. Please delete unused" \
      " sequences to create more."
    TOO_MANY_STEPS = "Your sequence has %s steps. The maximum allowed " \
      "is %s. Reduce the number of steps or move steps into subsequences."
    ARGS_OF_INTEREST = { "tool_id" => Tool,
                         "sequence_id" => Sequence,
                         "pointer_id" => Point }
    ALLOWED_NODE_KEYS = [
      "body",
      "kind",
      "args",
      "comment",
      :body,
      :kind,
      :args,
      :comment,
    ]

    def validate_step_count
      step_count = inputs[:body].length
      if step_count > device.max_seq_length
        message = TOO_MANY_STEPS % [step_count, device.max_seq_length]
        add_error(:step_count, :limit, message)
      end
    end

    def validate_sequence_count
      seq_count = Sequence.where(device_id: device.id).count
      if seq_count >= device.max_seq_count
        message = TOO_MANY_SEQUENCES % [seq_count, device.max_seq_count]
        add_error(:sequence_count, :limit, message)
      end
    end

    def validate_sequence
      # The code below strips out unneeded attributes, or attributes that
      # are not part of CeleryScript. We're only stripping attributes out of the
      # first level, though. Because of how EdgeNode and PrimaryNode work,
      # superfluous attributes will disappear on save and that's OK.
      (inputs[:body] || []).map! { |x| x.slice(*ALLOWED_NODE_KEYS) }
      add_error :body, :syntax_error, checker.error.message if !checker.valid?
      validate_step_count
      validate_sequence_count
    end

    def symbolized_input
      @symbolized_input ||= inputs.symbolize_keys.slice(:body, :kind, :args)
    end

    def tree
      hmm = {
        kind: "sequence",
        body: symbolized_input[:body],
        args: {
          version: Sequence::LATEST_VERSION,
          locals: symbolized_input
            .deep_symbolize_keys
            .dig(:args, :locals) || Sequence::SCOPE_DECLARATION,
        },
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
