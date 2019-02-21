# An AST Node in celery script MUST have a `kind` property (string) and an
# `args` property (dictionary). It also may have a `body`, which is an array of
# other nodes (*always* optional).
module CeleryScript
  class AstNode < AstBase
      attr_reader :args, :body, :comment, :kind, :parent
      BODY_HAS_NON_NODES = "The `body` of a node can only contain nodes- " \
                           "no leaves here."
      LEAVES_NEED_KEYS   = "Tried to initialize a leaf without a key."
      NEVER              = :__NEVER__
      FRIENDLY_ERRORS    = CeleryScript::Checker::FRIENDLY_ERRORS
      BAD_LEAF           = CeleryScript::Checker::BAD_LEAF

      def initialize(parent = nil, args:, body: nil, comment: "", kind:, uuid: nil)
          @comment, @kind, @parent = comment, kind, parent

          @args = args.map do |key, value|
            [key.to_sym, maybe_initialize(self, value, key)]
          end.to_h if args

          @body = body.map do |e|
            raise TypeCheckError, BODY_HAS_NON_NODES unless is_node?(e)
            maybe_initialize(self, e)
          end if body
      end

      def maybe_initialize(parent, leaf_or_node, key = NEVER)
        if is_node?(leaf_or_node)
          AstNode.new(parent, leaf_or_node)
        else
          raise TypeCheckError, LEAVES_NEED_KEYS if key == NEVER
          AstLeaf.new(parent, leaf_or_node, key)
        end
      end

      def is_node?(hash)
        hash.is_a?(Hash) &&
        hash.symbolize_keys! &&
        hash.has_key?(:kind) &&
        hash.has_key?(:args) &&
        (hash[:body].is_a?(Array) || hash[:body] == nil) &&
        (hash[:comment].is_a?(String) || hash[:comment] == nil) &&
        (hash[:args].is_a?(Hash)) &&
        (hash[:kind].is_a?(String))
      end

      # Calling this method with only one parameter
      # indicates a starting condition 🏁
      def resolve_variable!(origin = self)
        locals = args[:locals]

        if locals&.kind === "scope_declaration"
          label  = origin.args[:label]&.value
          result = (locals.body || []).select do |x|
            x.args[:label]&.value == label
          end.first
          return result if result
        end

        case parent
        when AstNode
          # sequence: Check the `scope` arg
          # Keep recursing if we can't find a scope on this node
          parent.resolve_variable!(origin)
        when nil # We've got an unbound variable.
          origin.invalidate!(UNBOUND_VAR % origin.args[:label].value)
        end
      end

      def todo
      # Don't delete this- it is currently unreachable code, but as soon as we
      # allow identifiers other than `point`, `tool` and `coordinate` we will
      # need it again (and can write tests)
      end

      def cross_check(corpus, key)
        actual  = kind
        allowed = corpus.fetchArg(key).allowed_values
        # It would be safe to run type checking here.
        if (actual == "identifier")
          allowed_types  = allowed.filter { |x| x.tag == :identifier }
          var = resolve_variable!
          case var.kind
          when "parameter_declaration" then todo
          when "variable_declaration"
            # REASSIGNMENT WARNING!:
            actual = var.args[:data_value].kind
          end
        end

        unless allowed.map(&:name).include?(actual)
          message = (FRIENDLY_ERRORS.dig(kind, parent.kind) || BAD_LEAF) % {
            kind:        kind,
            parent_kind: parent.kind,
            allowed:     allowed,
            actual:      actual
          }

          raise TypeCheckError, message
        end
      end
  end
end
