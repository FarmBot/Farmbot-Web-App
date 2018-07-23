# All configuration related to validation of sequences. This includes
# information such as which operators and labels are allowed, custom validations
# when a sequence is saved and related error messages that result.
# This module helps unclutter sequence.rb by sweeping CeleryScript config under
# the rug. Shoving configuration into a module is not a design pattern. Feedback
# welcome for refactoring of this code.
module CeleryScriptSettingsBag
  class BoxLed
    def self.exists?(id)
      true # Not super important right now. - RC 22 JUL 18
    end
  end

  # List of all celery script nodes that can be used as a varaible...
  ANY_VARIABLE          = [:tool, :coordinate, :point, :identifier]
  PLANT_STAGES          = %w(planned planted harvested)
  ALLOWED_PIN_MODES     = [DIGITAL = 0, ANALOG = 1]
  ALLOWED_RPC_NODES     = %w(home emergency_lock emergency_unlock read_status
                             sync check_updates power_off reboot toggle_pin
                             config_update calibrate execute move_absolute
                             move_relative write_pin read_pin send_message
                             factory_reset execute_script set_user_env wait
                             install_farmware update_farmware take_photo zero
                             install_first_party_farmware remove_farmware
                             find_home register_gpio unregister_gpio
                             set_servo_angle change_ownership dump_info)
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
  ALLOWED_LHS_TYPES     = [String, :named_pin]
  ALLOWED_LHS_STRINGS   = [*(0..69)].map{|x| "pin#{x}"}.concat(%w(x y z))
  ALLOWED_SPEC_ACTION   = %w(dump_info emergency_lock emergency_unlock power_off
                             read_status reboot sync take_photo)
  STEPS                 = %w(_if execute execute_script find_home move_absolute
                             move_relative read_pin send_message take_photo wait
                             write_pin )
  BAD_ALLOWED_PIN_MODES = '"%s" is not a valid pin_mode. Allowed values: %s'
  BAD_LHS               = 'Can not put "%s" into a left hand side (LHS) '\
                          'argument. Allowed values: %s'
  BAD_SUB_SEQ           = 'Sequence #%s does not exist.'
  NO_SUB_SEQ            = 'missing a sequence selection for `execute` block.'
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
  BAD_PIN_ID            = "Can't find %s with id of %s"
  NO_PIN_ID             = "You must select a %s before using it."
  BAD_POINTER_TYPE      = '"%s" is not a type of point. Allowed values: %s'
  BAD_PIN_TYPE          = '"%s" is not a type of pin. Allowed values: %s'
  BAD_SPEED             = "Speed must be a percentage between 1-100"
  PIN_TYPE_MAP          = { "Peripheral" => Peripheral,
                            "Sensor"     => Sensor,
                            "BoxLed3"    => BoxLed,
                            "BoxLed4"    => BoxLed }
  CANT_ANALOG           = "Analog modes are not supported for Box LEDs"
  ALLOWED_PIN_TYPES     = PIN_TYPE_MAP.keys
  KLASS_LOOKUP          = Point::POINTER_KINDS.reduce({}) do |acc, val|
    (acc[val] = Kernel.const_get(val)) && acc
  end

  Corpus = CeleryScript::Corpus
      .new
      .arg(:_else,        [:execute, :nothing])
      .arg(:_then,        [:execute, :nothing])
      .arg(:locals,       [:scope_declaration])
      .arg(:offset,       [:coordinate])
      .arg(:pin_number,   [Integer, :named_pin])
      .arg(:data_value,   ANY_VARIABLE)
      .arg(:location,     ANY_VARIABLE)
      .arg(:label,        [String])
      .arg(:milliseconds, [Integer])
      .arg(:package,      [String])
      .arg(:pin_value,    [Integer])
      .arg(:radius,       [Integer])
      .arg(:rhs,          [Integer])
      .arg(:url,          [String])
      .arg(:value,        [String, Integer, TrueClass, FalseClass])
      .arg(:version,      [Integer])
      .arg(:x,            [Integer, Float])
      .arg(:y,            [Integer, Float])
      .arg(:z,            [Integer, Float])
      .arg(:pin_id,       [Integer])
      .arg(:pin_type,     [String]) do |node|
        within(ALLOWED_PIN_TYPES, node) do |val|
          BAD_PIN_TYPE % [val.to_s, ALLOWED_PIN_TYPES.inspect]
        end
      end
      .arg(:pointer_id,   [Integer]) do |node|
        p_type = node&.parent&.args[:pointer_type]&.value
        klass  = KLASS_LOOKUP[p_type]
        # Don't try to validate if `pointer_type` is wrong.
        # That's a different respnsiblity.
        if(klass)
          bad_node = !klass.exists?(node.value)
          node.invalidate!(BAD_POINTER_ID % node.value) if bad_node
        end
      end
      .arg(:pointer_type, [String]) do |node|
        within(ALLOWED_POINTER_TYPE, node) do |val|
          BAD_POINTER_TYPE % [val.to_s, ALLOWED_POINTER_TYPE.inspect]
        end
      end
      .arg(:pin_mode, [Integer]) do |node|
        within(ALLOWED_PIN_MODES, node) do |val|
          BAD_ALLOWED_PIN_MODES % [val.to_s, ALLOWED_PIN_MODES.inspect]
        end
      end
      .arg(:sequence_id, [Integer]) do |node|
        if (node.value == 0)
          node.invalidate!(NO_SUB_SEQ)
        else
          missing = !Sequence.exists?(node.value)
          node.invalidate!(BAD_SUB_SEQ % [node.value]) if missing
        end
      end
      .arg(:lhs, ALLOWED_LHS_TYPES) do |node|
        case node
        when CeleryScript::AstNode
          # Validate `named_location` and friends.
        else
          # Validate strings.
          within(ALLOWED_LHS_STRINGS, node) do |val|
            BAD_LHS % [val.to_s, ALLOWED_LHS_STRINGS.inspect]
          end
        end
      end
      .arg(:op,              [String]) do |node|
        within(ALLOWED_OPS, node) do |val|
          BAD_OP % [val.to_s, ALLOWED_OPS.inspect]
        end
      end
      .arg(:channel_name,    [String]) do |node|
        within(ALLOWED_CHANNEL_NAMES, node) do |val|
          BAD_CHANNEL_NAME %  [val.to_s, ALLOWED_CHANNEL_NAMES.inspect]
        end
      end
      .arg(:message_type,    [String]) do |node|
        within(ALLOWED_MESSAGE_TYPES, node) do |val|
          BAD_MESSAGE_TYPE % [val.to_s, ALLOWED_MESSAGE_TYPES.inspect]
        end
      end
      .arg(:tool_id,         [Integer]) do |node|
        node.invalidate!(BAD_TOOL_ID % node.value) if !Tool.exists?(node.value)
      end
      .arg(:package, [String]) do |node|
        within(ALLOWED_PACKAGES, node) do |val|
          BAD_PACKAGE % [val.to_s, ALLOWED_PACKAGES.inspect]
        end
      end
      .arg(:axis, [String]) do |node|
        within(ALLOWED_AXIS, node) do |val|
          BAD_AXIS % [val.to_s, ALLOWED_AXIS.inspect]
        end
      end
      .arg(:message, [String]) do |node|
        notString = !node.value.is_a?(String)
        tooShort  = notString || node.value.length == 0
        tooLong   = notString || node.value.length > 300
        node.invalidate! BAD_MESSAGE if (tooShort || tooLong)
      end
      .arg(:speed, [Integer]) do |node|
        node.invalidate!(BAD_SPEED) unless node.value.between?(1, 100)
      end
      .arg(:data_type, [String]) do |node|
        within(ALLOWED_DATA_TYPES, node) do |v|
          BAD_DATA_TYPE % [v.to_s, ALLOWED_DATA_TYPES.inspect]
        end
      end
      .node(:named_pin, [:pin_type, :pin_id]) do |node|
        args  = HashWithIndifferentAccess.new(node.args)
        klass = PIN_TYPE_MAP.fetch(args[:pin_type].value)
        id    = args[:pin_id].value
        node.invalidate!(NO_PIN_ID % [klass]) if (id == 0)
        bad_node = !klass.exists?(id)
        node.invalidate!(BAD_PIN_ID % [klass.name, id]) if bad_node
      end
      .node(:nothing,               [])
      .node(:tool,                  [:tool_id])
      .node(:coordinate,            [:x, :y, :z])
      .node(:move_absolute,         [:location, :speed, :offset])
      .node(:move_relative,         [:x, :y, :z, :speed])
      .node(:write_pin,             [:pin_number, :pin_value, :pin_mode ]) { |n| no_analog(n) }
      .node(:read_pin,              [:pin_number, :label, :pin_mode])      { |n| no_analog(n) }
      .node(:channel,               [:channel_name])
      .node(:wait,                  [:milliseconds])
      .node(:send_message,          [:message, :message_type], [:channel])
      .node(:execute,               [:sequence_id])
      .node(:_if,                   [:lhs, :op, :rhs, :_then, :_else], [:pair])
      .node(:sequence,              [:version, :locals], STEPS)
      .node(:home,                  [:speed, :axis], [])
      .node(:find_home,             [:speed, :axis], [])
      .node(:zero,                  [:axis], [])
      .node(:emergency_lock,        [], [])
      .node(:emergency_unlock,      [], [])
      .node(:read_status,           [], [])
      .node(:sync,                  [], [])
      .node(:check_updates,         [:package], [])
      .node(:power_off,             [], [])
      .node(:reboot,                [], [])
      .node(:toggle_pin,            [:pin_number], [])
      .node(:explanation,           [:message], [])
      .node(:rpc_request,           [:label], ALLOWED_RPC_NODES)
      .node(:rpc_ok,                [:label], [])
      .node(:rpc_error,             [:label], [:explanation])
      .node(:calibrate,             [:axis], [])
      .node(:pair,                  [:label, :value], [])
      .node(:register_gpio,         [:pin_number, :sequence_id])
      .node(:unregister_gpio,       [:pin_number])
      .node(:config_update,         [:package], [:pair])
      .node(:factory_reset,         [:package], [])
      .node(:execute_script,        [:label], [:pair])
      .node(:set_user_env,          [], [:pair])
      .node(:take_photo,            [], [])
      .node(:point,                 [:pointer_type, :pointer_id], [])
      .node(:install_farmware,      [:url])
      .node(:update_farmware,       [:package])
      .node(:remove_farmware,       [:package])
      .node(:scope_declaration,     [], [:parameter_declaration, :variable_declaration])
      .node(:identifier,            [:label])
      .node(:variable_declaration,  [:label, :data_value], [])
      .node(:parameter_declaration, [:label, :data_type], [])
      .node(:set_servo_angle,       [:pin_number, :pin_value], [])
      .node(:change_ownership,      [], [:pair])
      .node(:dump_info,             [], [])
      .node(:install_first_party_farmware, [])

  ANY_ARG_NAME  = Corpus.as_json[:args].pluck("name").map(&:to_s)
  ANY_NODE_NAME = Corpus.as_json[:nodes].pluck("name").map(&:to_s)

  # Given an array of allowed values and a CeleryScript AST node, will DETERMINE
  # if the node contains a legal value. Throws exception and invalidates if not.
  def self.within(array, node)
    val = node&.value
    node.invalidate!(yield(val)) if !array.include?(val)
  end

  def self.no_analog(node)
    args         = HashWithIndifferentAccess.new(node.args)
    is_named_pin = args.fetch(:pin_number).kind == "named_pin"
    if is_named_pin && (args.fetch(:pin_mode).value == ANALOG)
      node.invalidate!(CANT_ANALOG)
    end
  end
end
