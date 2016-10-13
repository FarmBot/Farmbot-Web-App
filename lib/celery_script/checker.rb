module CeleryScript
  class TypeCheckError < StandardError; end
  class Checker
      attr_reader :tree, :corpus, :problems

      UNKNOWN_NODE_KIND = "`kind` attribute of node is not recognized."

      def initialize(tree, corpus)
          @tree, @corpus, @problems = tree, corpus, []
      end

      def run
        puts "========================================="
        check = ->(node) { validate_node(node) if node }
        TreeClimber.travel(tree, check)
        self
      end

      def validate_node(node)
          nd = corpus.fetchNodeSpecification(node.kind)
          if nd
            # TODO: Try &method(:problem)
            info = ValidationInfo.new(node, corpus, ->(n, m) { problem(n, m) })
            nd.validate(info)
          else
            problem(node, UNKNOWN_NODE_KIND)
          end
      end

      def problem(node, message)
          binding.pry
          raise TypeCheckError, Problem.new(node, message)
      end
  end
end
