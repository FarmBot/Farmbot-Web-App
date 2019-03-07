# When climbing the abstract syntax tree, any unparsable data is converted into
# a "leaf" type. It is a wrapper object around the original data, accessible via
# `.value`. As a matter of policy (and sanity) we do not allow objects or arrays
# as Leaf types. This is technically possible, but we really really don't want
# to do that. -RC
module CeleryScript
  class AstLeaf < AstBase
    FRIENDLY_ERRORS = CeleryScript::Checker::FRIENDLY_ERRORS
    BAD_LEAF        = CeleryScript::Checker::BAD_LEAF

    attr_reader :kind, :value, :parent
    def initialize(parent, value, kind)
      @parent, @value, @kind = parent, value, kind
    end

    def cross_check(corpus, _key = nil)
      allowed = corpus.fetchArg(kind).allowed_values
      unless allowed.any? { |spec| spec.valid?(self, corpus) }
        message = (FRIENDLY_ERRORS.dig(kind, parent.kind) || BAD_LEAF) % {
          kind:        kind,
          parent_kind: parent.kind,
          allowed:     "[#{allowed.map(&:name).join(", ")}]",
          actual:      value.class
        }
        raise TypeCheckError, message
      end
    end

  end
end
