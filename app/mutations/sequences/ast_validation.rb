module Sequences
  # Validate the syntax of a sequence body.
  # Just validates syntax. Does not perform any sort of contextual analysis. 
  class AstValidation < Mutations::Command

    PARAM_SCHEMA = {
        x:               Fixnum,
        y:               Fixnum,
        z:               Fixnum,
        speed:           Fixnum,
        pin_number:      Fixnum,
        pin_value:       Fixnum,
        pin_mode:        Fixnum, # Refine to 0 | 1;
        data_label:      String,
        milliseconds:    Fixnum,
        message:         String,
        sub_sequence_id: Fixnum, # Requires contextual analysis.
        lhs:             String, # "x" | "y" | "z" | "PUT_OTHER_STUFF_HERE";
        op:              String, # ">" | "<" | "is" | "not";
        rhs:             Fixnum
    }

    ARGS_SCHEMA = {
      move_absolute: [ :x, :y, :z, :speed],
      move_relative: [ :x, :y, :z, :speed ],        
      write_pin:     [ :pin_number, :pin_value, :pin_mode ],
      read_pin:      [ :pin_number, :data_label],
      wait:          [ :milliseconds ],
      send_message:  [ :message ],
      execute:       [ :sub_sequence_id ],
      if_statement:  [ :lhs, :op, :rhs, :sub_sequence_id ]
    }

    required do
      array :body do
        hash do
            string :kind, in: Sequence::NODE_KINDS
            duck :args, methods: [:[], :[]=]
            string :comments, default: nil
        end
      end
    end

    def validate
      body.each_with_index do |node, index|
        validate_structure(node, index)
      end
    end

    def execute
      inputs[:body].map do |hash|
        { # Strip out irrelevant keys.
          kind: hash[:kind],
          args: hash[:args],
          comments: hash[:comments]
        }
      end
    end

private
    def validate_structure(node, index)
      ARGS_SCHEMA[node[:kind].to_sym].each do |arg|
        value = node[:args][arg]
        unless value.is_a?(PARAM_SCHEMA[arg])
          add_error :bad_args,
          :bad_args,
          "Expected argument '#{}' of node"\
          " at position #{ index + 1 } to be a"\
          " #{ klass }, but got #{ p.class }"
        end
      end
    end
  end
end
