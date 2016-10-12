class AstNode
    attr_reader :args, :body, :comments, :kind, :parent
    def initialize(parent = nil, args:, body: nil, comment: "", kind:)
        @comment, @kind, @parent = comment, kind, parent

        @args = args.map  do |key, value|
          [key, maybe_initialize(key, value)]
        end.to_h if args

        @body = body.map do |e|
          maybe_initialize(self, e)
        end if body
    end

    def maybe_initialize(parent, hash)
      is_node?(hash) ? AstNode.new(self, **hash) : hash
    end

    def is_node?(hash)
      hash.is_a?(Hash) &&
      hash.has_key?(:kind) &&
      hash.has_key?(:args) &&
      (hash[:body].is_a?(Array) || hash[:body] == nil) &&
      (hash[:comment].is_a?(String) || hash[:comment] == nil) &&
      (hash[:args].is_a?(Hash)) &&
      (hash[:kind].is_a?(String))      
    end
end

# Temp stub.
class Parser
  def define(name, arg_types, body_types = nil)
    self
  end
end

Parser.new
  .define(
    # Define node name
    "sequence", {
      #define node args and sub args
      imports: ["import_statement"]
    }, [
    "var_set",
    "var_get",
    "move_absolute",
    "move_relative",
    "write_pin",
    "read_pin",
    "wait",
    "send_message",
    "execute",
    "if_statement"
   ]) {

   }
  .define("literal", {
    # Literal has "terminal" args (args that are not nodes).
    # Pass in the class you expect instead of a string.
    data_value: [String, "var_get"],
    data_type: [String]
  })

