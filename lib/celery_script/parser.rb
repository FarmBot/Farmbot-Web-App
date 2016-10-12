module CeleryScript
  class Parser
    def self.define(name, arg_types, body_types = nil)
      self
    end

    def self.undefine(name)
      self
    end

    def self.reset
    end

    def self.each_node(node, &blk)
      node.args.map  do |key, value|
        self.
      end.to_h if node.args

      node.body.map do |e|
        maybe_initialize(self, e)
      end if node.body
    end
  end
end