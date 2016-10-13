module CeleryScript
  class Problem
      attr_reader :node, :message

      def initialize(node, message)
          @node, @message = node, message
      end
  end
end
