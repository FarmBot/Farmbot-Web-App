# PROBLEM THIS CLASS SOLVES: You need to run a function against every node in
#    an abstract syntax tree, usually for validation or type checking.
module CeleryScript
  class TreeClimber
    def self.travel(node, callable)
      visit_node(node, callable)
      nil
    end

    def self.find_all_by_kind(node, name)
      results = []
      filter = -> (n) { results.push(n) if n.kind == name }
      travel(node, filter)
      results
    end

    def self.find_all_with_arg(node, arg_name)
      results = []
      filter = -> (n) { results.push(n) if n.args.has_key?(arg_name) }
      travel(node, filter)
      results
    end

  private

    def self.visit_node(node, callable)
      if node.is_a?(AstNode) # Keep recursing if it's not a leaf.
        callable.call(node)
        visit_each_arg(node, callable)
        visit_each_body_item(node, callable)
      end
    end

    def self.visit_each_arg(origin, callable)
      origin.args.map { |_, node| visit_node(node, callable) }
    end

    def self.visit_each_body_item(origin, callable)
      origin.body.map { |node| visit_node(node, callable) } if origin.body
    end
  end
end
