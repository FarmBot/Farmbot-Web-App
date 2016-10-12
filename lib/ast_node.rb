# 1. Travers the args
# 2. Traverse the body
        # @body = body.map { |hash| maybe_initialize(hash) } if body
        # binding.pry
# Sequencer
#  .add_kind("move_rel", {
#      x: ["literal", "var_get"],
#      speed: "literal"
#  }, ["if_statement", "exec_sequence"])
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
      hash.is_a?(Hash) && hash.has_key?(:kind) && hash.has_key?(:args)
    end
end
