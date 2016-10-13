module CeleryScript
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

      def maybe_initialize(parent, leaf_or_node)
        is_node?(leaf_or_node) ? AstNode.new(parent, **leaf_or_node) : hash
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
end
