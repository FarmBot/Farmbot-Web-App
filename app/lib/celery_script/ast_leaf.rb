# When climbing the abstract syntax tree, any unparsable data is converted into
# a "leaf" type. It is a wrapper object around the original data, accessible via
# `.value`. As a matter of policy (and sanity) we do not allow objects or arrays
# as Leaf types. This is technically possible, but we really really don't want
# to do that. -RC
module CeleryScript
  class AstLeaf < AstBase
    attr_reader :kind, :value, :parent
    def initialize(parent, value, kind)
      @parent, @value, @kind = parent, value, kind
    end
  end
end
