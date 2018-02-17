# All configuration related to validation of sequences. This includes
# information such as which operators and labels are allowed, custom validations
# when a sequence is saved and related error messages that result.
# This module helps unclutter sequence.rb by sweeping CeleryScript config under
# the rug. Shoving configuration into a module is not a design pattern. Feedback
# welcome for refactoring of this code.
module CeleryScriptSettingsBag
  # List of all celery script nodes that can be used as a varaible...
  ANY_VARIABLE          = [:tool, :coordinate, :point, :identifier]
  ALLOWED_PIN_MODES     = [DIGITAL = 0, ANALOG = 1]
  ALLOWED_RPC_NODES     = %w(home emergency_lock emergency_unlock read_status
                             sync check_updates power_off reboot toggle_pin
                             config_update calibrate execute move_absolute
                             move_relative write_pin read_pin send_message
                             factory_reset execute_script set_user_env wait
                             install_farmware update_farmware take_photo zero
                             install_first_party_farmware remove_farmware
                             find_home register_gpio unregister_gpio
                             set_servo_angle)
  ALLOWED_PACKAGES      = %w(farmbot_os arduino_firmware)
  ALLOWED_CHAGES        = %w(add remove update)
  RESOURCE_NAME         = %w(images plants regimens peripherals
                             corpuses logs sequences farm_events
                             tool_slots tools points tokens users device)
  ALLOWED_MESSAGE_TYPES = %w(success busy warn error info fun debug)
  ALLOWED_CHANNEL_NAMES = %w(ticker toast email espeak)
  ALLOWED_POINTER_TYPE  = %w(GenericPointer ToolSlot Plant)
  ALLOWED_DATA_TYPES    = %w(tool coordinate point)
  ALLOWED_OPS           = %w(< > is not is_undefined)
  ALLOWED_AXIS          = %w(x y z all)
  ALLOWED_LHS           = [*(0..69)].map{|x| "pin#{x}"}.concat(%w(x y z))
  STEPS                 = %w(_if execute execute_script find_home move_absolute
                             move_relative read_peripheral read_pin send_message
                             take_photo wait write_peripheral write_pin )
  BAD_ALLOWED_PIN_MODES = '"%s" is not a valid pin_mode. Allowed values: %s'
  BAD_LHS               = 'Can not put "%s" into a left hand side (LHS) '\
                          'argument. Allowed values: %s'
  BAD_SUB_SEQ           = 'Sequence #%s does not exist.'
  NO_SUB_SEQ            = 'missing a sequence selection for `execute` block.'
  NO_PERIPH             = 'You must select a peripheral before writing to it.'
  BAD_REGIMEN           = 'Regimen #%s does not exist.'
  BAD_OP                = 'Can not put "%s" into an operand (OP) argument. '\
                          'Allowed values: %s'
  BAD_CHANNEL_NAME      = '"%s" is not a valid channel_name. Allowed values: %s'
  BAD_DATA_TYPE         = '"%s" is not a valid data_type. Allowed values: %s'
  BAD_MESSAGE_TYPE      = '"%s" is not a valid message_type. Allowed values: %s'
  BAD_MESSAGE           = "Messages must be between 1 and 300 characters"
  BAD_TOOL_ID           = 'Tool #%s does not exist.'
  BAD_PERIPH_ID         = 'Peripheral #%s does not exist.'
  BAD_PACKAGE           = '"%s" is not a valid package. Allowed values: %s'
  BAD_AXIS              = '"%s" is not a valid axis. Allowed values: %s'
  BAD_POINTER_ID        = "Bad point ID: %s"
  BAD_POINTER_TYPE      = '"%s" is not a type of point. Allowed values: %s'
  BAD_SPEED             = "Speed must be a percentage between 1-100"

  Corpus = CeleryScript::Corpus
      .new
      .defineArg(:pointer_id, [Integer]) do |node|
        p_type = node&.parent&.args[:pointer_type]&.value
        klass  = Point::POINTER_KINDS[p_type]
        # Don't try to validate if `pointer_type` is wrong.
        # That's a different respnsiblity.
        if(klass)
          bad_node = !klass.exists?(node.value)
          node.invalidate!(BAD_POINTER_ID % node.value) if bad_node
        end
      end
      .defineArg(:pointer_type, [String]) do |node|
        within(ALLOWED_POINTER_TYPE, node) do |val|
          BAD_POINTER_TYPE % [val.to_s, ALLOWED_POINTER_TYPE.inspect]
        end
      end
      .defineArg(:pin_mode, [Integer]) do |node|
        within(ALLOWED_PIN_MODES, node) do |val|
          BAD_ALLOWED_PIN_MODES % [val.to_s, ALLOWED_PIN_MODES.inspect]
        end
      end
      .defineArg(:sequence_id, [Integer]) do |node|
        if (node.value == 0)
          node.invalidate!(NO_SUB_SEQ)
        else
          missing = !Sequence.exists?(node.value)
          node.invalidate!(BAD_SUB_SEQ % [node.value]) if missing
        end
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
      .defineArg(:tool_id,         [Integer]) do |node|
        node.invalidate!(BAD_TOOL_ID % node.value) if !Tool.exists?(node.value)
      end
      .defineArg(:package, [String]) do |node|
        within(ALLOWED_PACKAGES, node) do |val|
          BAD_PACKAGE % [val.to_s, ALLOWED_PACKAGES.inspect]
        end
      end
      .defineArg(:axis,            [String]) do |node|
        within(ALLOWED_AXIS, node) do |val|
          BAD_AXIS % [val.to_s, ALLOWED_AXIS.inspect]
        end
      end
      .defineArg(:version,         [Integer])
      .defineArg(:x,               [Integer])
      .defineArg(:y,               [Integer])
      .defineArg(:z,               [Integer])
      .defineArg(:radius,          [Integer])
      .defineArg(:speed,           [Integer]) do |node|
        node.invalidate!(BAD_SPEED) unless node.value.between?(1, 100)
      end
      .defineArg(:pin_number,      [Integer])
      .defineArg(:pin_value,       [Integer])
      .defineArg(:milliseconds,    [Integer])
      .defineArg(:rhs,             [Integer])
      .defineArg(:value,           [String, Integer, TrueClass, FalseClass])
      .defineArg(:label,           [String])
      .defineArg(:package,         [String])
      .defineArg(:message,         [String]) do |node|
        notString = !node.value.is_a?(String)
        tooShort  = notString || node.value.length == 0
        tooLong   = notString || node.value.length > 300
        node.invalidate! BAD_MESSAGE if (tooShort || tooLong)
      end
      .defineArg(:location,        ANY_VARIABLE)
      .defineArg(:offset,          [:coordinate])
      .defineArg(:_then,           [:execute, :nothing])
      .defineArg(:_else,           [:execute, :nothing])
      .defineArg(:url,             [String])
      .defineArg(:locals,          [:scope_declaration])
      .defineArg(:data_value,      ANY_VARIABLE)
      .defineArg(:data_type,       [String]) do |node|
        within(ALLOWED_DATA_TYPES, node) do |v|
          BAD_DATA_TYPE % [v.to_s, ALLOWED_DATA_TYPES.inspect]
        end
      end
      .defineArg(:peripheral_id,   [Integer]) do |node|
        if (node.value == 0)
          node.invalidate!(NO_PERIPH)
        else
          no_periph = !Peripheral.exists?(node.value)
          node.invalidate!(BAD_PERIPH_ID % node.value) if no_periph
        end
      end
      .defineNode(:read_peripheral,   [:peripheral_id, :pin_mode])
      .defineNode(:nothing,           [])
      .defineNode(:tool,              [:tool_id])
      .defineNode(:coordinate,        [:x, :y, :z])
      .defineNode(:move_absolute,     [:location, :speed, :offset])
      .defineNode(:move_relative,     [:x, :y, :z, :speed])
      .defineNode(:write_pin,         [:pin_number, :pin_value, :pin_mode ])
      .defineNode(:write_peripheral,  [:peripheral_id, :pin_value, :pin_mode])
      .defineNode(:read_pin,          [:pin_number, :label, :pin_mode])
      .defineNode(:channel,           [:channel_name])
      .defineNode(:wait,              [:milliseconds])
      .defineNode(:send_message,      [:message, :message_type], [:channel])
      .defineNode(:execute,           [:sequence_id])
      .defineNode(:_if,               [:lhs, :op, :rhs, :_then, :_else], [:pair])
      .defineNode(:sequence,          [:version, :locals], STEPS)
      .defineNode(:home,              [:speed, :axis], [])
      .defineNode(:find_home,         [:speed, :axis], [])
      .defineNode(:zero,              [:axis], [])
      .defineNode(:emergency_lock,    [], [])
      .defineNode(:emergency_unlock,  [], [])
      .defineNode(:read_status,       [], [])
      .defineNode(:sync,              [], [])
      .defineNode(:check_updates,     [:package], [])
      .defineNode(:power_off,         [], [])
      .defineNode(:reboot,            [], [])
      .defineNode(:toggle_pin,        [:pin_number], [])
      .defineNode(:explanation,       [:message], [])
      .defineNode(:rpc_request,       [:label], ALLOWED_RPC_NODES)
      .defineNode(:rpc_ok,            [:label], [])
      .defineNode(:rpc_error,         [:label], [:explanation])
      .defineNode(:calibrate,         [:axis], [])
      .defineNode(:pair,              [:label, :value], [])
      .defineNode(:register_gpio,     [:pin_number, :sequence_id])
      .defineNode(:unregister_gpio,   [:pin_number])
      .defineNode(:config_update,     [:package], [:pair])
      .defineNode(:factory_reset,     [:package], [])
      .defineNode(:execute_script,    [:label], [:pair])
      .defineNode(:set_user_env,      [], [:pair])
      .defineNode(:take_photo,        [], [])
      .defineNode(:point,             [:pointer_type, :pointer_id], [])
      .defineNode(:install_farmware,  [:url])
      .defineNode(:update_farmware,   [:package])
      .defineNode(:remove_farmware,   [:package])
      .defineNode(:scope_declaration, [], [:parameter_declaration, :variable_declaration])
      .defineNode(:identifier,            [:label])
      .defineNode(:variable_declaration,  [:label, :data_value], [])
      .defineNode(:parameter_declaration, [:label, :data_type], [])
      .defineNode(:set_servo_angle,   [:pin_number, :pin_value], [])
      .defineNode(:install_first_party_farmware, [])

  ANY_ARG_NAME  = Corpus.as_json[:args].pluck("name").map(&:to_s)
  ANY_NODE_NAME = Corpus.as_json[:nodes].pluck("name").map(&:to_s)

  # Given an array of allowed values and a CeleryScript AST node, will DETERMINE
  # if the node contains a legal value. Throws exception and invalidates if not.
  def self.within(array, node)
    val = node&.value
    node.invalidate!(yield(val)) if !array.include?(val)
  end
end
# {kind: "set_servo_angle", args: {pin_number: 4 | 5, pin_value: 0..360}}
