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
        corpus
          .fetchNode(node.kind)
          .allowed_args
          .map { |aa| corpus.fetchArg(aa) }
          .map do |argSpec|
            binding.pry
          end
      when AstLeaf
        puts "Skipping (for now?)"
      else
        raise TypeCheckError, "What was that?"
      end
    end
  end
end
