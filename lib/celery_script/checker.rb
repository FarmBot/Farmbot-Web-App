module CeleryScript
  class Checker
      attr_reader :tree, :corpus, :problems

      UNKNOWN_NODE_KIND = "`kind` attribute of node is not recognized."

      def initialize(tree, corpus)
          @tree, @corpus, @problems = tree, corpus, []
      end

      def run
        check = ->(node) { validate_node(node) }
        TreeClimber.travel(tree, check)
        self
      end

      def validate_node(node)
          nd = corpus.fetchNodeDeclaration(node.kind)
          if nd
            reporter = ->(n, m) { problem(n, m) }
            nd.validate(node, corpus, reporter)
          else
            binding.pry
            problem(node, UNKNOWN_NODE_KIND)
          end
      end

      def problem(node, message)
          problems.push(Problem.new(node, message))
      end
  end
end
