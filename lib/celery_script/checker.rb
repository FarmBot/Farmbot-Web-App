module CeleryScript
  class TypeCheckError < StandardError; end
  class LeafValue
    attr_reader :val
    def initialize(val)
      @val = val
    end
  end

  class NodeValue
    attr_reader :val
    def initialize(val)
      @val = val
    end
  end

  class Checker
    attr_reader :tree, :corpus

    def initialize(tree, corpus)
      @tree, @corpus = tree, corpus
      self.freeze
    end

    def run!
      cb = method(:validate_node)
      CeleryScript::TreeClimber.travel(tree, cb.to_proc)
      tree
    end

    def validate_node(node)
      check_arity(node)
      node.args.map do |array|
        should_be = array.first
        node      = array.last
        check_arg_validity(should_be, node)
      end
      #    * Run user defined validations
    end

    def check_arity(node)
      corpus
        .fetchNode(node.kind)
        .allowed_args
        .map do |arg|
          has_key = node.args.has_key?(arg) || node.args.has_key?(arg.to_s)
          raise TypeCheckError unless has_key
        end
      has      = node.args.keys.map(&:to_sym) # Either bigger or equal.
      required = corpus.fetchNode(node.kind).allowed_args # Always smallest.
      raise TypeCheckError unless (has.length === required.length)
    end

    def check_arg_validity(should_be, node)
      # 2. DONT check validity of body? write test to verify...
      case node
      when AstNode
      when AstLeaf
        allowed = corpus
                    .fetchArg(node.kind)
                    .allowed_values
                    .select { |d| d.is_a?(Class) }
        actual = node.value.class
        unless allowed.include?(actual)
          raise TypeCheckError, "Expected leaf '#{ node.kind }' within "\
                                "'#{ node.parent.kind }' to be one of: "\
                                "#{ allowed.inspect } but got #{ actual.inspect }"
        end
        puts "VALID LEAF!"
      else
        raise TypeCheckError, "What was that?"
      end
    end

    def validate_agaist_spec(argSpec, node)
      argSpec.allowed_values.map do |value|
        case value
        when Class
          # binding.pry
        when Symbol, String
          # binding.pry
        else; raise TypeCheckError, "What was that?"
        end
      end
    end
  end
end
