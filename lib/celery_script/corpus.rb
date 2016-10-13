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

  class Corpus
    def defineArg(arg_name, allowed_values)
    #   additional_checks.call("node", "err_callback")
      self
    end

    def defineNode(kind, allowed_args, allowed_body_nodes = [])
      self
    end
  end
end
