# All configuration related to validation of sequences. This includes
# information such as which operators and labels are allowed, custom validations
# when a sequence is saved and related error messages that result.
# This module helps unclutter sequence.rb by sweeping CeleryScript config under
# the rug. Shoving configuration into a module is not a design pattern. Feedback
# welcome for refactoring of this code.
module CeleryScriptSettingsBag
  DIGITAL, ANALOG       = 0, 1
  ALLOWED_PIN_MODES     = [DIGITAL, ANALOG]
  ALLOWED_MESSAGE_TYPES = %w(success busy warn error info fun)
  ALLOWED_CHANNEL_NAMES = %w(ticker toast)
  ALLOWED_DATA_TYPES    = %w(string integer)
  ALLOWED_OPS           = %w(< > is not)
  STEPS                 = %w(move_absolute move_relative write_pin read_pin wait
                             send_message execute _if)
  ALLOWED_LHS           = %w(pin0 pin1 pin2 pin3 pin4 pin5 pin6 pin7 pin8 pin9
                             pin10 pin11 pin12 pin13 x y z)
  BAD_ALLOWED_PIN_MODES = 'Can not put "%s" into a left hand side (LHS) '\
                          'argument. Allowed values: %s'
  BAD_LHS               = 'Can not put "%s" into a left hand side (LHS) '\
                          'argument. Allowed values: %s'
  BAD_SUB_SEQ           = 'Sequence #%s does not exist.'
  BAD_OP                = 'Can not put "%s" into an operand (OP) argument. '\
                          'Allowed values: %s'
  BAD_CHANNEL_NAME      = '"%s" is not a valid channel_name. Allowed values: %s'
  BAD_MESSAGE_TYPE      = '"%s" is not a valid message_type. Allowed values: %s'
  BAD_TOOL_ID           = 'Tool #%s does not exist.'

  Corpus = CeleryScript::Corpus
      .new
      .defineArg(:pin_mode,        [Fixnum]) do |node|
        within(ALLOWED_PIN_MODES, node) do |val|
          BAD_ALLOWED_PIN_MODES % [val.to_s, ALLOWED_LHS.inspect]
        end
      end
      .defineArg(:sub_sequence_id, [Fixnum]) do |node|
        missing = !Sequence.exists?(node.value)
        node.invalidate!(BAD_SUB_SEQ % [node.value]) if missing
      end
      .defineArg(:lhs,             [String]) do |node|
        within(ALLOWED_LHS, node) do |val|
          BAD_LHS % [val.to_s, ALLOWED_LHS.inspect]
        end
      end
      .defineArg(:op,              [String]) do |node|
        within(ALLOWED_OPS, node) do |val|
          BAD_OP % [val.to_s, ALLOWED_OPS.inspect]
        end
      end
      .defineArg(:channel_name,    [String]) do |node|
        within(ALLOWED_CHANNEL_NAMES, node) do |val|
          BAD_CHANNEL_NAME %  [val.to_s, ALLOWED_CHANNEL_NAMES.inspect]
        end
      end
      .defineArg(:message_type,    [String]) do |node|
        within(ALLOWED_MESSAGE_TYPES, node) do |val|
          BAD_MESSAGE_TYPE % [val.to_s, ALLOWED_MESSAGE_TYPES.inspect]
        end
      end
      .defineArg(:tool_id,         [Fixnum]) do |node|
        node.invalidate!(BAD_TOOL_ID % node.value) if !Tool.exists?(node.value)
      end
      .defineArg(:version,         [Fixnum])
      .defineArg(:x,               [Fixnum])
      .defineArg(:y,               [Fixnum])
      .defineArg(:z,               [Fixnum])
      .defineArg(:speed,           [Fixnum])
      .defineArg(:pin_number,      [Fixnum])
      .defineArg(:pin_value,       [Fixnum])
      .defineArg(:milliseconds,    [Fixnum])
      .defineArg(:rhs,             [Fixnum])
      .defineArg(:data_label,      [String])
      .defineArg(:message,         [String])
      .defineArg(:location,        [:tool, :coordinate])
      .defineArg(:offset,          [:coordinate])
      .defineArg(:_then,           [:execute, :nothing])
      .defineArg(:_else,           [:execute, :nothing])
      .defineNode(:nothing,        [])
      .defineNode(:tool,           [:tool_id])
      .defineNode(:coordinate,     [:x, :y, :z])
      .defineNode(:move_absolute,  [:location, :speed, :offset])
      .defineNode(:move_relative,  [:x, :y, :z, :speed])
      .defineNode(:write_pin,      [:pin_number, :pin_value, :pin_mode ])
      .defineNode(:read_pin,       [:pin_number, :data_label, :pin_mode])
      .defineNode(:channel,        [:channel_name])
      .defineNode(:wait,           [:milliseconds])
      .defineNode(:send_message,   [:message, :message_type], [:channel])
      .defineNode(:execute,        [:sub_sequence_id])
      .defineNode(:_if,            [:lhs, :op, :rhs, :_then, :_else])
      .defineNode(:sequence,       [:version], STEPS)
      .defineNode(:emergency_lock,        [],[])
      .defineNode(:emergency_unlock,      [],[])
      .defineNode(:exec_sequence,         [:sub_sequence_id])
      .defineNode(:home_all,              [:speed],[])
      .defineNode(:home_x,                [:speed],[])
      .defineNode(:home_y,                [:speed],[])
      .defineNode(:home_z,                [:speed],[])
      .defineNode(:move_absolute,         [],[])
      .defineNode(:move_relative,         [],[])
      .defineNode(:write_pin,             [],[])
      .defineNode(:read_status,           [],[])
      .defineNode(:sync,                  [],[])
      .defineNode(:mcu_config_update,     [],[])
      .defineNode(:bot_config_update,     [],[])
      .defineNode(:status_update,         [],[])
      .defineNode(:check_updates,         [],[])
      .defineNode(:check_arduino_updates, [],[])
      .defineNode(:power_off,             [],[])
      .defineNode(:reboot,                [],[])
      .defineNode(:toggle_pin,            [],[])
      .defineNode(:start_regimen,         [],[])
      .defineNode(:stop_regimen,          [],[])
      .defineNode(:calibrate,             [],[])
      .defineNode(:dump_logs,             [],[])

  # Given an array of allowed values and a CeleryScript AST node, will DETERMINE
  # if the node contains a legal value. Throws exception and invalidates if not.
  def self.within(array, node)
    val = node&.value
    node.invalidate!(yield(val)) if !array.include?(val)
  end
end