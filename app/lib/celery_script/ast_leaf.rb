module CeleryScript
  class AstLeaf < AstBase
    attr_reader :kind, :value, :parent
    def initialize(parent, value, kind)
      @parent, @value, @kind = parent, value, kind
    end
  end
end