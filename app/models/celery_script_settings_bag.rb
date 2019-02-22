# All configuration related to validation of sequences. This includes
# information such as which operators and labels are allowed, custom validations
# when a sequence is saved and related error messages that result.
# This module helps unclutter sequence.rb by sweeping CeleryScript config under
# the rug. Shoving configuration into a module is not a design pattern. Feedback
# welcome for refactoring of this code.
module CeleryScriptSettingsBag
  class BoxLed
    def self.name
      "Raspberry Pi Box LED"
    end

    def self.exists?(id)
      true # Not super important right now. - RC 22 JUL 18
    end
  end

  PIN_TYPE_MAP = { "Peripheral" => Peripheral,
                   "Sensor" => Sensor,
                   "BoxLed3" => BoxLed,
                   "BoxLed4" => BoxLed }
  ALLOWED_AXIS = %w(x y z all)
  ALLOWED_CHAGES = %w(add remove update)
  ALLOWED_CHANNEL_NAMES = %w(ticker toast email espeak)
  ALLOWED_EVERY_POINT_TYPE = %w(Tool GenericPointer Plant ToolSlot)
  ALLOWED_LHS_STRINGS = [*(0..69)].map { |x| "pin#{x}" }.concat(%w(x y z))
  ALLOWED_LHS_TYPES = [String, :named_pin]
  ALLOWED_MESSAGE_TYPES = %w(success busy warn error info fun debug)
  ALLOWED_OPS = %w(< > is not is_undefined)
  ALLOWED_PACKAGES = %w(farmbot_os arduino_firmware)
  ALLOWED_PIN_MODES = [DIGITAL = 0, ANALOG = 1]
  ALLOWED_PIN_TYPES = PIN_TYPE_MAP.keys
  ALLOWED_POINTER_TYPE = %w(GenericPointer ToolSlot Plant)
  ALLOWED_RESOURCE_TYPE = %w(Device FarmEvent Image Log Peripheral Plant Point
                             Regimen Sequence Tool ToolSlot User GenericPointer)
  ALLOWED_RPC_NODES = %w(calibrate change_ownership check_updates dump_info
                         emergency_lock emergency_unlock execute execute_script
                         factory_reset find_home home install_farmware
                         install_first_party_farmware _if move_absolute
                         move_relative power_off read_pin read_status reboot
                         remove_farmware resource_update send_message
                         set_servo_angle set_user_env sync take_photo
                         toggle_pin update_farmware wait write_pin zero)
  ALLOWED_SPEC_ACTION = %w(dump_info emergency_lock emergency_unlock power_off
                           read_status reboot sync take_photo)
  ANY_VARIABLE = %i(tool coordinate point identifier every_point)
  BAD_ALLOWED_PIN_MODES = '"%s" is not a valid pin_mode. Allowed values: %s'
  BAD_AXIS = '"%s" is not a valid axis. Allowed values: %s'
  BAD_CHANNEL_NAME = '"%s" is not a valid channel_name. Allowed values: %s'
  BAD_EVERY_POINT_TYPE = '"%s" is not a type of group. Allowed values: %s'
  BAD_LHS = 'Can not put "%s" into a left hand side (LHS)' \
  " argument. Allowed values: %s"
  BAD_MESSAGE = "Messages must be between 1 and 300 characters"
  BAD_MESSAGE_TYPE = '"%s" is not a valid message_type. Allowed values: %s'
  BAD_OP = 'Can not put "%s" into an operand (OP) argument. ' \
  "Allowed values: %s"
  BAD_PACKAGE = '"%s" is not a valid package. Allowed values: %s'
  BAD_PERIPH_ID = "Peripheral #%s does not exist."
  BAD_PIN_TYPE = '"%s" is not a type of pin. Allowed values: %s'
  BAD_POINTER_ID = "Bad point ID: %s"
  BAD_POINTER_TYPE = '"%s" is not a type of point. Allowed values: %s'
  BAD_REGIMEN = "Regimen #%s does not exist."
  BAD_RESOURCE_ID = "Can't find %s with id of %s"
  BAD_RESOURCE_TYPE = '"%s" is not a valid resource_type. Allowed values: %s'
  BAD_SPEED = "Speed must be a percentage between 1-100"
  BAD_SUB_SEQ = "Sequence #%s does not exist."
  BAD_TOOL_ID = "Tool #%s does not exist."
  CANT_ANALOG = "Analog modes are not supported for Box LEDs"
  NO_PIN_ID = "%s requires a valid pin number"
  NO_SUB_SEQ = "missing a sequence selection for `execute` block."
  ONLY_ONE_COORD = "Move Absolute does not accept a group of locations " \
  "as input. Please change your selection to a single" \
  " location."
  PLANT_STAGES = %w(planned planted harvested sprouted)
  RESOURCE_UPDATE_ARGS = [:resource_type, :resource_id, :label, :value]
  SCOPE_DECLARATIONS = [:variable_declaration, :parameter_declaration]

  Corpus = CeleryScript::Corpus.new

  CORPUS_VALUES = {
    boolean: [TrueClass, FalseClass],
    float: [Float],
    integer: [Integer],
    string: [String],
  }.map { |(name, list)| Corpus.value(name, list) }

  CORPUS_ENUM = {
    axis: [ALLOWED_AXIS, BAD_AXIS],
    channel_name: [ALLOWED_CHANNEL_NAMES, BAD_CHANNEL_NAME],
    every_point_type: [ALLOWED_EVERY_POINT_TYPE, BAD_EVERY_POINT_TYPE],
    lhs: [ALLOWED_LHS_STRINGS, BAD_LHS],
    message_type: [ALLOWED_MESSAGE_TYPES, BAD_MESSAGE_TYPE],
    op: [ALLOWED_OPS, BAD_OP],
    package: [ALLOWED_PACKAGES, BAD_PACKAGE],
    pin_mode: [ALLOWED_PIN_MODES, BAD_ALLOWED_PIN_MODES],
    pin_type: [ALLOWED_PIN_TYPES, BAD_PIN_TYPE],
    pointer_type: [ALLOWED_POINTER_TYPE, BAD_POINTER_TYPE],
    resource_type: [ALLOWED_RESOURCE_TYPE, BAD_RESOURCE_TYPE],
  }.map { |(name, list)| Corpus.enum(name, *list) }

  def self.e(symbol)
    CeleryScript::Corpus::Enum.new(symbol)
  end

  def self.n(symbol)
    CeleryScript::Corpus::Node.new(symbol)
  end

  def self.v(symbol)
    CeleryScript::Corpus::Value.new(symbol)
  end

  ANY_VAR_TOKENIZED = ANY_VARIABLE.map { |x| n(x) }

  CORPUS_ARGS = {
    _else: {
      defn: [n(:execute), n(:nothing)],
    },
    _then: {
      defn: [n(:execute), n(:nothing)],
    },
    data_value: {
      defn: ANY_VAR_TOKENIZED,
    },
    default_value: {
      defn: ANY_VAR_TOKENIZED,
    },
    label: {
      defn: [v(:string)],
    },
    locals: {
      defn: [n(:scope_declaration)],
    },
    location: {
      defn: ANY_VAR_TOKENIZED,
    },
    milliseconds: {
      defn: [v(:integer)],
    },
    offset: {
      defn: [n(:coordinate)],
    },
    pin_id: {
      defn: [v(:integer)],
    },
    pin_number: {
      defn: [v(:integer), n(:named_pin)],
    },
    pin_value: {
      defn: [v(:integer)],
    },
    radius: {
      defn: [v(:integer)],
    },
    resource_id: {
      defn: [v(:integer)],
    },
    rhs: {
      defn: [v(:integer)],
    },
    url: {
      defn: [v(:string)],
    },
    value: {
      defn: [v(:string), v(:integer), v(:boolean)],
    },
    version: { defn: [v(:integer)] },
    x: { defn: [v(:integer), v(:float)] },
    y: { defn: [v(:integer), v(:float)] },
    z: { defn: [v(:integer), v(:float)] },
    pin_type: {
      defn: [e(:pin_type)],
    },
    pointer_id: {
      defn: [v(:integer)],
      blk: -> (node, device) do
        bad_node = !Point.where(id: node.value, device_id: device.id).exists?
        node.invalidate!(BAD_POINTER_ID % node.value) if bad_node
      end,
    },
    pointer_type: {
      defn: [e(:pointer_type)],
    },
    pin_mode: {
      defn: [e(:pin_mode)],
    },
    sequence_id: {
      defn: [v(:integer)],
      blk: -> (node) do
        if (node.value == 0)
          node.invalidate!(NO_SUB_SEQ)
        else
          missing = !Sequence.exists?(node.value)
          node.invalidate!(BAD_SUB_SEQ % [node.value]) if missing
        end
      end,
    },
    lhs: {
      defn: [v(:string), n(:named_pin)], # See ALLOWED_LHS_TYPES
      blk: -> (node) do
        x = [ALLOWED_LHS_STRINGS, node, BAD_LHS]
        # This would never have happened if we hadn't allowed
        #  heterogenus args :(
        manual_enum(*x) unless node.is_a?(CeleryScript::AstNode)
      end,
    },
    op: {
      defn: [e(:op)],
    },
    channel_name: {
      defn: [e(:channel_name)],
    },
    message_type: {
      defn: [e(:message_type)],
    },
    tool_id: {
      defn: [v(:integer)],
      blk: -> (node) do
        node.invalidate!(BAD_TOOL_ID % node.value) if !Tool.exists?(node.value)
      end,
    },
    package: {
      defn: [e(:package)],
    },
    axis: {
      defn: [e(:axis)],
    },
    message: {
      defn: [v(:string)],
      blk: -> (node) do
        notString = !node.value.is_a?(String)
        tooShort = notString || node.value.length == 0
        tooLong = notString || node.value.length > 300
        node.invalidate! BAD_MESSAGE if (tooShort || tooLong)
      end,
    },
    speed: {
      defn: [v(:integer)],
    },
    resource_type: {
      defn: [e(:resource_type)],
    },
    every_point_type: {
      defn: [e(:every_point_type)],
    },
  }.map do |(name, conf)|
    blk = conf[:blk]
    defn = conf.fetch(:defn)
    blk ? Corpus.arg(name, defn, &blk) : Corpus.arg(name, defn)
  end

  IDEA_BIN = [
    :function,
    :data,
    :private,

  ]

  CORPUS_NODES = {
    _if: {
      args: [:lhs, :op, :rhs, :_then, :_else], body: [:pair], tags: [:control_flow],
    },
    calibrate: {
      args: [:axis], tags: [:function, :firmware_user],
    },
    change_ownership: {
      body: [:pair], tags: [:function, :network_user, :disk_user, :cuts_power],
    },
    channel: {
      args: [:channel_name], tags: [:data],
    },
    check_updates: {
      args: [:package], tags: [:function, :network_user, :disk_user, :cuts_power],
    },
    coordinate: {
      args: [:x, :y, :z], tags: [:data, :location_like],
    },
    dump_info: {
      tags: [:function, :network_user, :disk_user],
    },
    emergency_lock: { tags: [:function, :firmware_user, :control_flow] },
    emergency_unlock: {
      tags: [:function, :firmware_user],
    },
    every_point: {
      args: [:every_point_type], tags: [:data],
    },
    execute_script: {
      args: [:label], body: [:pair], tags: [:function],
    },
    execute: {
      args: [:sequence_id], body: [:parameter_application], tags: [:function],
    },
    explanation: {
      args: [:message], tags: [:data],
    },
    factory_reset: {
      args: [:package], tags: [:function],
    },
    find_home: {
      args: [:speed, :axis], tags: [:function],
    },
    home: {
      args: [:speed, :axis], tags: [:function],
    },
    identifier: {
      args: [:label], tags: [:data],
    },
    install_farmware: {
      args: [:url], tags: [:function],
    },
    install_first_party_farmware: { tags: [:function] },
    internal_entry_point: { tags: ["private"] },
    internal_farm_event: {
      body: [:parameter_application], tags: ["private"],
    },
    internal_regimen: {
      body: %i(parameter_application parameter_declaration variable_declaration),
      tags: ["private"],
    },
    move_relative: {
      args: [:x, :y, :z, :speed],
    },
    nothing: {},
    pair: {
      args: [:label, :value],
    },
    parameter_application: {
      args: [:label, :data_value],
    },
    parameter_declaration: {
      args: [:label, :default_value],
    },
    point: {
      args: [:pointer_type, :pointer_id],
    },
    power_off: {},
    read_status: {},
    reboot: {
      args: [:package],
    },
    remove_farmware: {
      args: [:package],
    },
    rpc_error: {
      args: [:label], body: [:explanation],
    },
    rpc_ok: {
      args: [:label],
    },
    rpc_request: {
      args: [:label], body: ALLOWED_RPC_NODES,
    },
    scope_declaration: {
      body: SCOPE_DECLARATIONS,
    },
    send_message: {
      args: [:message, :message_type], body: [:channel],
    },
    sequence: {
      args: [:version, :locals], body: ALLOWED_RPC_NODES,
    },
    set_servo_angle: {
      args: [:pin_number, :pin_value],
    },
    set_user_env: {
      body: [:pair],
    },
    sync: {},
    take_photo: {},
    toggle_pin: {
      args: [:pin_number],
    },
    tool: {
      args: [:tool_id],
    },
    update_farmware: {
      args: [:package],
    },
    variable_declaration: {
      args: [:label, :data_value],
    },
    wait: {
      args: [:milliseconds],
    },
    zero: {
      args: [:axis],
    },
    named_pin: {
      args: [:pin_type, :pin_id],
      blk: -> (node) do
        args = HashWithIndifferentAccess.new(node.args)
        klass = PIN_TYPE_MAP.fetch(args[:pin_type].value)
        id = args[:pin_id].value
        node.invalidate!(NO_PIN_ID % [klass.name]) if (id == 0)
        bad_node = !klass.exists?(id)
        no_resource(node, klass, id) if bad_node
      end,
    },
    move_absolute: {
      args: [:location, :speed, :offset],
      blk: -> (n) do
        loc = n.args[:location].try(:kind)
        n.invalidate!(ONLY_ONE_COORD) if loc == "every_point"
      end,
    },
    write_pin: {
      args: [:pin_number, :pin_value, :pin_mode],
      blk: -> (n) { no_rpi_analog(n) },
    },
    read_pin: {
      args: [:pin_number, :label, :pin_mode],
      blk: -> (n) { no_rpi_analog(n) },
    },
    resource_update: {
      args: RESOURCE_UPDATE_ARGS,
      blk: -> (x) do
        resource_type = x.args.fetch(:resource_type).value
        resource_id = x.args.fetch(:resource_id).value
        check_resource_type(x, resource_type, resource_id)
      end,
    },
  }
    .map { |(name, list)| Corpus.node(name, **list) }

  ANY_ARG_NAME = Corpus.as_json[:args].pluck("name").map(&:to_s)
  ANY_NODE_NAME = Corpus.as_json[:nodes].pluck("name").map(&:to_s)

  def self.no_resource(node, klass, resource_id)
    node.invalidate!(BAD_RESOURCE_ID % [klass.name, resource_id])
  end

  def self.check_resource_type(node, resource_type, resource_id)
    case resource_type # <= Security critical code (for const_get'ing)
    when "Device"
      # When "resource_type" is "Device", resource_id always refers to
      # the current_device.
      # For convenience, we try to set it here, defaulting to 0
      node.args[:resource_id].instance_variable_set("@value", 0)
    when *ALLOWED_RESOURCE_TYPE.without("Device")
      klass = Kernel.const_get(resource_type)
      resource_ok = klass.exists?(resource_id)
      no_resource(node, klass, resource_id) unless resource_ok
    end
  end

  # Given an array of allowed values and a CeleryScript AST node, will DETERMINE
  # if the node contains a legal value. Throws exception and invalidates if not.
  def self.manual_enum(array, node, tpl)
    val = node.try(:value)
    unless array.include?(val)
      node.invalidate!(tpl % [val.to_s, array.inspect])
    end
  end

  def self.no_rpi_analog(node)
    args = HashWithIndifferentAccess.new(node.args)
    pin_mode = args.fetch(:pin_mode).try(:value) || DIGITAL
    pin_number = args.fetch(:pin_number)
    is_analog = pin_mode == ANALOG
    is_node = pin_number.is_a?(CeleryScript::AstNode)
    needs_check = is_analog && is_node

    if needs_check
      pin_type_args = pin_number.args.with_indifferent_access
      pin_type = pin_type_args.fetch(:pin_type).try(:value) || ""
      node.invalidate!(CANT_ANALOG) if pin_type.include?("BoxLed")
    end
  end
end
