module CeleryScript
  class TreeClimber
    def self.travel(node, callable = nil, &blk)
      puts ""
      visit_node(node, callable || blk)
    end

    def self.find_by_kind(node)
    end

  private

    def self.visit_node(node, callable)
      if node.is_a?(AstNode)
        puts "visiting #{node.kind}"
        callable.call(node)
        visit_each_arg(node, callable)
        visit_each_body_item(node, callable)
      else
        puts "Skip     #{node.to_s.first(40)}"
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
