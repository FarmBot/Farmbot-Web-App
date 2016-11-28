module CeleryScript
  class TypeCheckError < StandardError; end
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

    def run
      error || tree
    end
    
    def valid?
      error ? false : true
    end

    def error
      run!
      nil
    rescue TypeCheckError => e
      e
    end

    private

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
        allowed = corpus
        .fetchNode(node.kind)
        .allowed_args
        allowed.map do |arg|
          has_key = node.args.has_key?(arg) || node.args.has_key?(arg.to_s)
          unless has_key
            msgs = node.args.keys.join(", ")
            msgs = "nothing" if msgs.length < 1
          msg = "Expected node '#{node.kind}' to have a '#{arg}',"\
          " but got: #{ msgs }."
          raise TypeCheckError, msg
          end
        end
      has      = node.args.keys.map(&:to_sym) # Either bigger or equal.
      required = corpus.fetchNode(node.kind).allowed_args # Always smallest.
      if !(has.length === required.length)
        extras = has - required
        raise TypeCheckError, "'#{node.kind}' has unexpected arguments: "\
                              "#{extras}. Allowed arguments: #{allowed}"
      end
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
      else
        raise TypeCheckError, "Expected '#{should_be}' to be a node or leaf, "\
                              "but it was neither"
      end
      validator = corpus.fetchArg(should_be).additional_validation
      validator.call(node, TypeCheckError, corpus) if(validator)
    end
  end
end
