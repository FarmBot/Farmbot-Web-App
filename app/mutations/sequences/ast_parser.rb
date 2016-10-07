require_relative "./ast_validators"

module Sequences
  # Validate the syntax of a sequence body.
  # Just validates syntax and removes irrelevant junk.
  # Does not perform any sort of contextual analysis. 
  class AstParser < Mutations::Command
    extend AstValidators

    ast_body :required

    def validate
      body.each_with_index do |node, index|
        validate_structure(node, index)
      end

      # TODO: I think this will be slow.
      # I have no evidence, though.
      body.each_with_index do |node, index|
        node[:args].keys.each do |key|
          name = "validate_#{ key }"
          send(name, node, index) if respond_to?(name)
        end
      end
    end

    def execute
      inputs[:body]
    end

    def validate_pin_mode(node, index)
      actual = node[:args][:pin_mode]
      unless Sequence::ALLOWED_PIN_MODES.include?(actual)
        sorry("'pin_mode'",
              index + 1,
              "be " + Sequence::ALLOWED_PIN_MODES.join(" or "),
              "got #{ actual }")
      end
    end

    def validate_op(node, index)
      actual = node[:args][:op]
      unless Sequence::ALLOWED_OPS.include?(actual)
        sorry("'op' (operand)",
              index + 1,
              "be one of " + Sequence::ALLOWED_OPS.join(", ") + ", ",
              "got " + actual)
      end
    end

    def validate_lhs(node, index)
      actual = node[:args][:lhs]
      unless Sequence::ALLOWED_LHS.include?(actual)
        sorry("'lhs' (left hand side)",
              index + 1,
              "one of: " + Sequence::ALLOWED_LHS.join(", "),
              actual)
      end
    end

    def validate_data_type(node, index)
      actual = node[:args][:data_type]
      # "Expected data_type in step 1 to one of: string, integer but object"
      unless Sequence::ALLOWED_DATA_TYPES.include?(actual)
        sorry("'data_type'",
              index + 1,
              "be one of: " + Sequence::ALLOWED_DATA_TYPES.join(", ") + ",",
              "got '#{ actual }'")
      end
    end

    def validate_data_value(node, index)
      type  = node[:args][:data_type]
      value = node[:args][:data_value]
      case type
      when "integer"
        sorry("'data_value'",
              index + 1,
              "be an integer",
              "got non-integer input") if !(value =~ /^-?\d+$/)
      end
    end

private

    def validate_structure(node, index)
      Sequence::ARGS_SCHEMA[node[:kind].to_sym].each do |arg|
        value = node[:args][arg]
        klass = Sequence::PARAM_SCHEMA[arg]
        sorry("'#{ arg }'",
              index + 1,
              klass,
              value.class.name) unless value.is_a?(klass)
      end
    end

    def sorry(cause, location, expected, actual)
          add_error :bad_args,
          :bad_args,
          "Expected #{ cause } in step #{ location }"\
          " to #{ expected } but #{ actual }"
    end
  end
end
