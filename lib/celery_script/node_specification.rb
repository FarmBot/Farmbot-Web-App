module CeleryScript
  class NodeSpecification
    attr_reader :kind, :args, :body, :validator

    UNKNOWN_ARG_TYPE = "Node contains unrecognized arg attributes "
    TOO_MANY_ARGS    = "Node has extra arguments"
    TOO_FEW_ARGS     = "Node has too few arguments"
    MISSING_ARG      = "Node is missing argument "
    WRONG_KIND       = "Wrong node kind"

    def initialize(kind, args, body, validator = nil)
      @kind, @args, @body, @validator = kind, args, body, validator
    end

    def validate(info)
      # Check that:
      # 0. No extra nodes
      # 1. All args are present on node
      # 2. If it's a node, Maybe run custom validators before recursing?
      # 2. If it's a node, Recurse
      # 3. If it's a leaf, Type check
      check_arity(info)
      args.each do |arg_name|
        if arg_name.is_a?(Class)
          check_leaf(arg_name, info)
        else
          check_node(arg_name, info)
        end
      end

      # (Recursively?) Check body types
      body.each do |kind|
      end
    end

  private

    def check_arity(info)
      actual   = info.node.args.keys.map(&:to_sym).sort
      expected = info.corpus.fetchNodeSpecification(info.node.kind).args.sort
      "#{info.node.kind} node has keys #{info.node.args.keys}"
      binding.pry if !(actual - expected).empty?
      return info.report_problem(TOO_MANY_ARGS) if !(actual - expected).empty?
      return info.report_problem(TOO_FEW_ARGS) unless (actual === expected)
    rescue => e
      binding.pry
    end

    def check_node(arg_name, last_info)
      # ---
      # A sequence must have x and we already know its there.
      # ensure X "kind" is one of ["blah"]
      # Recurse
      # Custom validations must pass.
      # ---
      # "kind" must equal "blah"!!
      info = ValidationInfo.new(last_info.node.args[arg_name],
                                last_info.corpus,
                                last_info.instance_variable_get(:@problem))

      ensure_correct_kind(arg_name, info)
      recurse_into_arg(arg_name, info)
      run_custom_checks(arg_name, info)
    end

    def check_leaf(arg_name, info)
      binding.pry
    end

    def ensure_correct_kind(should_be_a, info)
      allowed_kinds = info.corpus.fetchArgSpecification(should_be_a).types.sort  
      actual_kind   = info.node.kind.to_sym
      not_allowed   = !allowed_kinds.include?(actual_kind)

      if not_allowed
        m = "I expected the #{should_be_a} property on a "\
        "#{info.node.parent.kind} node to be one of #{ allowed_kinds } but it "\
        "was actually #{ actual_kind }"

        info.report_problem(m)
      end
    rescue => e
      binding.pry
    end

    def recurse_into_arg(arg_name, info)
      validate(info)
    end

    def run_custom_checks(arg_name, info)
      binding.pry
    end
  end
end

