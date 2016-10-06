module Sequences
  # Validate the syntax of a sequence body.
  # Just validates syntax. Does not perform any sort of contextual analysis. 
  class AstValidation < Mutations::Command
    PARAM_SCHEMA      = {
        x:               Fixnum,
        y:               Fixnum,
        z:               Fixnum,
        speed:           Fixnum,
        pin_number:      Fixnum,
        pin_value:       Fixnum,
        pin_mode:        Fixnum,
        data_label:      String,
        milliseconds:    Fixnum,
        message:         String,
        sub_sequence_id: Fixnum, # TODO Requires contextual analysis.
        lhs:             String,
        op:              String,
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

    ALLOWED_OPS       = ["<", ">", "is", "not"]
    ALLOWED_PIN_MODES = [0, 1]
    ALLOWED_LHS       = [ "x", "y", "z", "s", "busy",
                          "param_version", "movement_timeout_x",
                          "movement_timeout_y", "movement_timeout_z",
                          "movement_invert_endpoints_x", "movement_invert_endpoints_y",
                          "movement_invert_endpoints_z", "movement_invert_motor_x",
                          "movement_invert_motor_y", "movement_invert_motor_z",
                          "movement_steps_acc_dec_x", "movement_steps_acc_dec_y",
                          "movement_steps_acc_dec_z", "movement_home_up_x",
                          "movement_home_up_y", "movement_home_up_z", "movement_min_spd_x",
                          "movement_min_spd_y", "movement_min_spd_z", "movement_max_spd_x",
                          "movement_max_spd_y", "movement_max_spd_z", "time", "pin0", "pin1",
                          "pin2", "pin3", "pin4", "pin5", "pin6", "pin7", "pin8", "pin9",
                          "pin10", "pin11", "pin12", "pin13", ]
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
      unless ALLOWED_PIN_MODES.include?(actual)
        sorry("pin_mode",
              index + 1,
              ALLOWED_PIN_MODES.join(" or "),
              actual)
      end
    end

    def validate_op(node, index)
      actual = node[:args][:op]
      unless ALLOWED_OPS.include?(actual)
        sorry("op (operand)",
              index + 1,
              ALLOWED_OPS.join(" or "),
              actual)
      end
    end

    def validate_lhs(node, index)
      actual = node[:args][:lhs]
      unless ALLOWED_LHS.include?(actual)
        sorry("lhs (left hand side)",
              index + 1,
              "one of: " + ALLOWED_LHS.join(", "),
              actual)
      end
    end

private

    def validate_structure(node, index)
      ARGS_SCHEMA[node[:kind].to_sym].each do |arg|
        value = node[:args][arg]
        klass = PARAM_SCHEMA[arg]
        sorry(arg,
              index + 1,
              klass,
              value.class.name) unless value.is_a?(klass)
      end
    end

    def sorry(cause, location, expected, actual)
          add_error :bad_args,
          :bad_args,
          "Expected '#{ cause }' of step"\
          " #{ location } to be #{ expected }, "\
          "got #{ actual }"
    end
  end
end
