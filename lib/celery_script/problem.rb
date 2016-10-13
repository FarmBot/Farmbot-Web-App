module CeleryScript
  class Problem
      attr_reader :node, :message

      def initialize(node, message)
          @node, @message = node, message
      end

      def to_s
        inspect
      end

      def inspect
        "Error with '#{node.kind}': #{message}"
      end
  end
end
