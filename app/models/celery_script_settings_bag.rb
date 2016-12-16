# Let's not pretend that shoving configuration into a module is a design pattern
# I am going to unclutter sequence.rb by sweeping CeleryScript config under
# the rug.
module CeleryScriptSettingsBag
  ALLOWED_PIN_MODES     = [0, 1]
  ALLOWED_MESSAGE_TYPES = %w(success busy warn error info fun)
  ALLOWED_CHANNEL_NAMES = %w(ticker toast)
  ALLOWED_DATA_TYPES    = %w(string integer)
  ALLOWED_OPS           = %w(< > is not)
  STEPS = %w(move_absolute move_relative write_pin read_pin wait send_message
             execute if_statement)
  ALLOWED_LHS = %w(busy pin0 pin1 pin2 pin3 pin4 pin5 pin6 pin7 pin8 pin9 pin10
                   pin11 pin12 pin13 x y z)

  Corpus = CeleryScript::Corpus
      .new
      .defineArg(:pin_mode,        [Fixnum]) do |node|
        within(ALLOWED_PIN_MODES, node) do |val|
          "Can not put \"#{ val.to_s }\" into a left hand side (LHS)"\
          " argument. Allowed values: #{ALLOWED_LHS.map(&:to_s).join(", ")}"
        end
      end
      .defineArg(:sub_sequence_id, [Fixnum]) do |node|
        missing = !Sequence.exists?(node.value)
        node.invalidate!("Sequence ##{ node.value } does not exist.") if missing
      end
      .defineArg(:lhs,             [String]) do |node|
        within(ALLOWED_LHS, node) do |val|
          "Can not put \"#{ val.to_s }\" into a left hand side (LHS)"\
          " argument. Allowed values: #{ALLOWED_LHS.map(&:to_s).join(", ")}"
        end
      end
      .defineArg(:op,              [String]) do |node|
        within(ALLOWED_OPS, node) do |val|
          "Can not put \"#{ val.to_s }\" into an operand (OP)"\
          " argument. Allowed values: #{ALLOWED_OPS.map(&:to_s).join(", ")}"
        end
      end
      .defineArg(:channel_name,    [String]) do |node|
        within(ALLOWED_CHANNEL_NAMES, node) do |val|
          "\"#{ val.to_s }\" is not a valid channel_name. " \
          "Allowed values: #{ALLOWED_CHANNEL_NAMES.map(&:to_s).join(", ")}"
        end
      end
      .defineArg(:message_type,    [String]) do |node|
        within(ALLOWED_MESSAGE_TYPES, node) do |val|
          "\"#{ val.to_s }\" is not a valid message_type. " \
          "Allowed values: #{ALLOWED_MESSAGE_TYPES.map(&:to_s).join(", ")}"
        end
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
      .defineNode(:move_absolute,  [:x, :y, :z, :speed])
      .defineNode(:move_relative,  [:x, :y, :z, :speed])
      .defineNode(:write_pin,      [:pin_number, :pin_value, :pin_mode ])
      .defineNode(:read_pin,       [:pin_number, :data_label, :pin_mode])
      .defineNode(:channel,        [:channel_name])
      .defineNode(:wait,           [:milliseconds])
      .defineNode(:send_message,   [:message, :message_type], [:channel])
      .defineNode(:execute,        [:sub_sequence_id])
      .defineNode(:if_statement,   [:lhs, :op, :rhs, :sub_sequence_id])
      .defineNode(:sequence,       [:version], STEPS)

  def self.within(array, node)
    val = node&.value
    node.invalidate!(yield(val)) if !array.include?(val)
  end
end