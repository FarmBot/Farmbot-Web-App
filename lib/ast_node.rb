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
    attr_reader :args, :body, :comments, :kind
    def initialize(args:, body: nil, comment: "", kind:)
        @comment, @kind = comment, kind

        @args = args.map {|m,e| [m, maybe_initialize(e)] }.to_h if args
        @body = body.map {|e| maybe_initialize(e) } if body
    rescue => e
      binding.pry
    end

    def maybe_initialize(hash)
      well_formed?(hash) ? AstNode.new(**hash) : hash
    end

    def well_formed?(hash)
      hash.is_a?(Hash) && hash.has_key?(:kind) && hash.has_key?(:args)
    end
end
