# An AST Node in celery script MUST have a `kind` property (string) and an
# `args` property (dictionary). It also may have a `body`, which is an array of
# other nodes (*always* optional).
module CeleryScript
  class AstNode < AstBase
      attr_reader :args, :body, :comment, :kind, :parent
      BODY_HAS_NON_NODES = "The `body` of a node can only contain nodes- " \
                           "no leaves here."
      LEAVES_NEED_KEYS   = "Tried to initialize a leaf without a key."
      NEVER              = :__NEVER__

      def initialize(parent = nil,
                     args:,
                     body: nil,
                     comment: "",
                     kind:,
                     uuid: nil)
          @comment, @kind, @parent = comment, kind, parent

          @args = args.map do |key, value|
            [key.to_sym, maybe_initialize(self, value, key)]
          end.to_h if args

          @body = body.map do |e|
            raise TypeCheckError, BODY_HAS_NON_NODES unless is_node?(e)
            maybe_initialize(self, e)
          end if body
      end

      def maybe_initialize(parent, leaf_or_node, key = NEVER)
        if is_node?(leaf_or_node)
          AstNode.new(parent, leaf_or_node)
        else
          raise TypeCheckError, LEAVES_NEED_KEYS if key == NEVER
          AstLeaf.new(parent, leaf_or_node, key)
        end
      end

      def is_node?(hash)
        hash.is_a?(Hash) &&
        hash.symbolize_keys! &&
        hash.has_key?(:kind) &&
        hash.has_key?(:args) &&
        (hash[:body].is_a?(Array) || hash[:body] == nil) &&
        (hash[:comment].is_a?(String) || hash[:comment] == nil) &&
        (hash[:args].is_a?(Hash)) &&
        (hash[:kind].is_a?(String))
      end
  end
end
