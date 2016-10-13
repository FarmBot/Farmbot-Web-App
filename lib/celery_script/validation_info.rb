# A bundle of relevant information when type checking a Node as well as behvaior
# for reporting the problems back to the relevant checker instance.
# Basically, [node, corpus, problem] were always getting passed around together.
module CeleryScript
  class ValidationInfo
      attr_reader :node, :corpus

      def initialize(node, corpus, problem)
        binding.pry unless node
        raise "Node is required" unless node
        @node, @corpus, @problem = node, corpus, problem
        self.freeze
      end

      def report_problem(reason)
        @problem.call(node, reason)
      end
  end
end
