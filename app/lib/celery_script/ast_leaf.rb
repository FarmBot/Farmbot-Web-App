# When climbing the abstract syntax tree, any unparsable data is converted into
# a "leaf" type. It is a wrapper object around the original data, accessible via
# `.value`.
module CeleryScript
  class AstLeaf < AstBase
    attr_reader :kind, :value, :parent
    def initialize(parent, value, kind)
      @parent, @value, @kind = parent, value, kind
    end
  end
end
