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
  ALLOWED_ASSERTION_TYPES = %w(abort recover abort_recover)
  ALLOWED_CHANGES = %w(add remove update)
  ALLOWED_CHANNEL_NAMES = %w(ticker toast email espeak)
  ALLOWED_LHS_STRINGS = [*(0..69)].map { |x| "pin#{x}" }.concat(%w(x y z))
  ALLOWED_LHS_TYPES = [String, :named_pin]
  ALLOWED_MESSAGE_TYPES = %w(success busy warn error info fun debug)
  ALLOWED_OPS = %w(< > is not is_undefined)
  ALLOWED_PACKAGES = %w(farmbot_os arduino_firmware)
  ALLOWED_PIN_MODES = [DIGITAL = 0, ANALOG = 1]
  ALLOWED_PIN_TYPES = PIN_TYPE_MAP.keys
  ALLOWED_POINTER_TYPE = %w(GenericPointer ToolSlot Plant)
  ALLOWED_RESOURCE_TYPE = %w(Device Point Plant ToolSlot GenericPointer)
  ALLOWED_RPC_NODES = %w(calibrate change_ownership
                         check_updates dump_info emergency_lock
                         emergency_unlock execute execute_script
                         factory_reset find_home flash_firmware home
                         install_farmware install_first_party_farmware _if
                         move_absolute move_relative power_off read_pin
                         read_status reboot remove_farmware resource_update
                         send_message set_servo_angle set_user_env sync
                         take_photo toggle_pin update_farmware wait
                         write_pin zero)
  ALLOWED_SPEC_ACTION = %w(dump_info emergency_lock emergency_unlock power_off
                           read_status reboot sync take_photo)
  ANY_VARIABLE = %i(tool coordinate point identifier)
  BAD_ALLOWED_PIN_MODES = '"%s" is not a valid pin_mode. Allowed values: %s'
  BAD_ASSERTION_TYPE = '"%s" is not a valid assertion type. Try these instead: %s'
  BAD_AXIS = '"%s" is not a valid axis. Allowed values: %s'
  BAD_CHANNEL_NAME = '"%s" is not a valid channel_name. Allowed values: %s'
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
  NO_SUB_SEQ = "You must select a Sequence in the Execute step."
  ONLY_ONE_COORD = "Move Absolute does not accept a group of locations " \
  "as input. Please change your selection to a single" \
  " location."
  PLANT_STAGES = %w(planned planted harvested sprouted)
  RESOURCE_UPDATE_ARGS = [:resource_type, :resource_id, :label, :value]
  SCOPE_DECLARATIONS = [:variable_declaration, :parameter_declaration]
  MISC_ENUM_ERR = '"%s" is not valid. Allowed values: %s'
  MAX_WAIT_MS = 1000 * 60 * 3 # Three Minutes
  MAX_WAIT_MS_EXCEEDED =
    "A single wait node cannot exceed #{MAX_WAIT_MS / 1000 / 60} minutes. " +
    "Consider lowering the wait time or using multiple WAIT blocks."
  Corpus = CeleryScript::Corpus.new

  CORPUS_VALUES = {
    boolean: [TrueClass, FalseClass],
    float: [Float],
    integer: [Integer],
    string: [String],
  }.map { |(name, list)| Corpus.value(name, list) }

  CORPUS_ENUM = {
    ALLOWED_AXIS: [ALLOWED_AXIS, BAD_AXIS],
    ALLOWED_CHANNEL_NAMES: [ALLOWED_CHANNEL_NAMES, BAD_CHANNEL_NAME],
    ALLOWED_MESSAGE_TYPES: [ALLOWED_MESSAGE_TYPES, BAD_MESSAGE_TYPE],
    ALLOWED_OPS: [ALLOWED_OPS, BAD_OP],
    ALLOWED_PACKAGES: [ALLOWED_PACKAGES, BAD_PACKAGE],
    ALLOWED_PIN_MODES: [ALLOWED_PIN_MODES, BAD_ALLOWED_PIN_MODES],
    ALLOWED_ASSERTION_TYPES: [ALLOWED_ASSERTION_TYPES, BAD_ASSERTION_TYPE],
    AllowedPinTypes: [ALLOWED_PIN_TYPES, BAD_PIN_TYPE],
    Color: [Sequence::COLORS, MISC_ENUM_ERR],
    DataChangeType: [ALLOWED_CHANGES, MISC_ENUM_ERR],
    LegalSequenceKind: [ALLOWED_RPC_NODES.sort, MISC_ENUM_ERR],
    lhs: [ALLOWED_LHS_STRINGS, BAD_LHS],
    PlantStage: [PLANT_STAGES, MISC_ENUM_ERR],
    PointType: [ALLOWED_POINTER_TYPE, BAD_POINTER_TYPE],
    resource_type: [ALLOWED_RESOURCE_TYPE, BAD_RESOURCE_TYPE],
  }.each { |(name, list)| Corpus.enum(name, *list) }

  def self.e(symbol)
    raise "Missing symbol: #{symbol}" unless CORPUS_ENUM.key?(symbol)
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
    x: {
      defn: [v(:integer), v(:float)],
    },
    y: {
      defn: [v(:integer), v(:float)],
    },
    z: {
      defn: [v(:integer), v(:float)],
    },
    pin_type: {
      defn: [e(:AllowedPinTypes)],
    },
    pointer_id: {
      defn: [v(:integer)],
      blk: ->(node, device) do
        bad_node = !Point.where(id: node.value, device_id: device.id).exists?
        node.invalidate!(BAD_POINTER_ID % node.value) if bad_node
      end,
    },
    pointer_type: {
      defn: [e(:PointType)],
    },
    pin_mode: {
      defn: [e(:ALLOWED_PIN_MODES)],
    },
    sequence_id: {
      defn: [v(:integer)],
      blk: ->(node) do
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
      blk: ->(node) do
        x = [ALLOWED_LHS_STRINGS, node, BAD_LHS]
        # This would never have happened if we hadn't allowed
        #  heterogenous args :(
        manual_enum(*x) unless node.is_a?(CeleryScript::AstNode)
      end,
    },
    op: {
      defn: [e(:ALLOWED_OPS)],
    },
    priority: { defn: [v(:integer)] },
    channel_name: {
      defn: [e(:ALLOWED_CHANNEL_NAMES)],
    },
    message_type: {
      defn: [e(:ALLOWED_MESSAGE_TYPES)],
    },
    tool_id: {
      defn: [v(:integer)],
      blk: ->(node) do
        node.invalidate!(BAD_TOOL_ID % node.value) if !Tool.exists?(node.value)
      end,
    },
    package: {
      defn: [v(:string)],
      # `package` has an ambiguous intent depending on who is using the arg
      # (FBOS vs. API). Corpus-native enums cannot be used for validation
      # outside of the API. If `package` _was_ declared as a native enum (rather
      # than a string), it would cause false type errors in FE/FBJS.
      blk: ->(node) do
        manual_enum(ALLOWED_PACKAGES, node, BAD_PACKAGE)
      end,
    },
    axis: {
      defn: [e(:ALLOWED_AXIS)],
    },
    message: {
      defn: [v(:string)],
      blk: ->(node) do
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
    assertion_type: {
      defn: [e(:ALLOWED_ASSERTION_TYPES)],
    },
    lua: {
      defn: [v(:string)],
    },
  }.map do |(name, conf)|
    blk = conf[:blk]
    defn = conf.fetch(:defn)
    blk ? Corpus.arg(name, defn, &blk) : Corpus.arg(name, defn)
  end

  CORPUS_NODES = {
    assertion: {
      args: [:assertion_type, :_then, :lua],
      tags: [:*],
    },
    _if: {
      args: [:lhs, :op, :rhs, :_then, :_else],
      body: [:pair],
      tags: [:*],
    },
    calibrate: {
      args: [:axis],
      tags: [:function, :firmware_user],
    },
    change_ownership: {
      body: [:pair],
      tags: [:function, :network_user, :disk_user, :cuts_power, :api_writer],
      blk: ->(node) { raise "Never." }, # Security critical.
      docs: "Not a commonly used node. May be removed without notice.",
    },
    channel: {
      args: [:channel_name],
      tags: [:data],
      docs: "Specifies a communication path for log messages.",
    },
    check_updates: {
      args: [:package],
      tags: [:function, :network_user, :disk_user, :cuts_power],
    },
    coordinate: {
      args: [:x, :y, :z],
      tags: [:data, :location_like],
    },
    dump_info: {
      tags: [:function, :network_user, :disk_user, :api_writer],
      docs: "Sends an info dump to server administrators for troubleshooting.",
    },
    emergency_lock: {
      tags: [:function, :firmware_user, :control_flow],
    },
    emergency_unlock: {
      tags: [:function, :firmware_user],
    },
    execute_script: {
      args: [:label],
      body: [:pair],
      tags: [:*],
    },
    execute: {
      args: [:sequence_id],
      body: [:parameter_application],
      tags: [:*],
    },
    explanation: {
      args: [:message],
      tags: [:data],
    },
    factory_reset: {
      args: [:package],
      tags: [:function, :cuts_power],
    },
    find_home: {
      args: [:speed, :axis],
      tags: [:function, :firmware_user],
    },
    flash_firmware: {
      args: [:package],
      tags: [:api_writer, :disk_user, :firmware_user, :function, :network_user],
    },
    home: {
      args: [:speed, :axis],
      tags: [:function, :firmware_user],
    },
    identifier: {
      args: [:label],
      tags: [:data],
    },
    install_farmware: {
      args: [:url],
      tags: [:function, :network_user, :disk_user, :api_writer],
    },
    install_first_party_farmware: {
      tags: [:function, :network_user],
    },
    internal_entry_point: {
      tags: [:private],
    },
    internal_farm_event: {
      body: [:parameter_application],
      tags: [],
    },
    internal_regimen: {
      body: %i(parameter_application parameter_declaration variable_declaration),
      tags: [],
    },
    move_relative: {
      args: [:x, :y, :z, :speed],
      tags: [:firmware_user, :function],
    },
    nothing: {
      tags: [:data, :function],
    },
    pair: {
      args: [:label, :value],
      tags: [:data],
    },
    parameter_application: {
      args: [:label, :data_value],
      tags: [:function, :control_flow, :scope_writer],
    },
    parameter_declaration: {
      args: [:label, :default_value],
      tags: [:scope_writer],
    },
    point: {
      args: [:pointer_type, :pointer_id],
      tags: [:location_like, :data],
    },
    power_off: {
      tags: [:cuts_power, :function],
    },
    read_status: {
      tags: [:function],
    },
    reboot: {
      args: [:package],
      tags: [:cuts_power, :function, :firmware_user],
    },
    remove_farmware: {
      args: [:package],
      tags: [:function],
    },
    rpc_error: {
      args: [:label],
      body: [:explanation],
      tags: [:data],
    },
    rpc_ok: {
      args: [:label],
      tags: [:data],
    },
    rpc_request: {
      args: [:label, :priority],
      body: ALLOWED_RPC_NODES,
      tags: [:*],
    },
    scope_declaration: {
      body: SCOPE_DECLARATIONS,
      tags: [:scope_writer],
    },
    send_message: {
      args: [:message, :message_type],
      body: [:channel],
      tags: [:function],
    },
    sequence: {
      args: [:version, :locals],
      body: ALLOWED_RPC_NODES,
      tags: [:*],
    },
    set_servo_angle: {
      args: [:pin_number, :pin_value],
      tags: [:function, :firmware_user],
    },
    set_user_env: {
      body: [:pair],
      tags: [:function, :disk_user],
    },
    sync: {
      tags: [:disk_user, :network_user, :function],
    },
    take_photo: {
      tags: [:disk_user, :function],
    },
    toggle_pin: {
      args: [:pin_number],
      tags: [:function, :firmware_user],
    },
    tool: {
      args: [:tool_id],
      tags: [:data, :location_like, :api_validated],
    },
    update_farmware: {
      args: [:package],
      tags: [:function, :network_user, :api_validated],
    },
    variable_declaration: {
      args: [:label, :data_value],
      tags: [:scope_writer, :function],
    },
    wait: {
      args: [:milliseconds],
      tags: [:function],
      blk: ->(node) do
        ms_arg = node.args[:milliseconds]
        ms = (ms_arg && ms_arg.value) || 0
        node.invalidate!(MAX_WAIT_MS_EXCEEDED) if ms > MAX_WAIT_MS
      end,
    },
    zero: {
      args: [:axis],
      tags: [:function, :firmware_user],
    },
    named_pin: {
      args: [:pin_type, :pin_id],
      tags: [:api_validated, :firmware_user, :rpi_user, :data, :function],
      blk: ->(node) do
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
      tags: [:function, :firmware_user],
    },
    write_pin: {
      args: [:pin_number, :pin_value, :pin_mode],
      tags: [:function, :firmware_user, :rpi_user],
      blk: ->(n) { no_rpi_analog(n) },
    },
    read_pin: {
      args: [:pin_number, :label, :pin_mode],
      tags: [:function, :firmware_user, :rpi_user],
      blk: ->(n) { no_rpi_analog(n) },
    },
    resource_update: {
      args: RESOURCE_UPDATE_ARGS,
      tags: [:function, :api_writer, :network_user],
      blk: ->(n) do
        resource_type = n.args.fetch(:resource_type).value
        resource_id = n.args.fetch(:resource_id).value
        check_resource_type(n, resource_type, resource_id, Device.current)
      end,
    },
  }.map { |(name, list)| Corpus.node(name, **list) }

  HASH = Corpus.as_json
  ANY_ARG_NAME = HASH[:args].pluck("name").map(&:to_s)
  ANY_NODE_NAME = HASH[:nodes].pluck("name").map(&:to_s)

  Corpus.enum(:LegalArgString, ANY_ARG_NAME, MISC_ENUM_ERR)
  Corpus.enum(:LegalKindString, ANY_NODE_NAME.map(&:camelize), MISC_ENUM_ERR)

  def self.no_resource(node, klass, resource_id)
    node.invalidate!(BAD_RESOURCE_ID % [klass.name, resource_id])
  end

  def self.check_resource_type(node, resource_type, resource_id, owner)
    raise "OPPS!" unless owner
    case resource_type # <= Security critical code (for const_get'ing)
    when "Device"
      # When "resource_type" is "Device", resource_id always refers to
      # the current_device.
      # For convenience, we try to set it here, defaulting to 0
      node.args[:resource_id].instance_variable_set("@value", owner.id)
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
