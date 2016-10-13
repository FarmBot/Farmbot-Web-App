module CeleryScript
  class ArgumentSpecification
    attr_reader :name, :allowed_values, :additional_validation
    NOOP = ->(_, __) { }

    def initialize(name, allowed_values, additional_validation = NOOP)
      @name                  = name
      @allowed_values        = allowed_values
      @additional_validation = additional_validation
    end
  end

  class NodeSpecification
    attr_reader :name, :allowed_args, :allowed_body_types

    def initialize(name, allowed_args, allowed_body_types)
      @name                  = name
      @allowed_args          = allowed_args  
      @allowed_body_types    = allowed_body_types   
    end
  end

  class Corpus
    def initialize
      @arg_def_list = {}
      @node_def_list = {}      
    end

    def fetchArg(name)
      @arg_def_list[name.to_sym] or raise "CANT FIND ARG SPEC"
    end

    def defineArg(arg_name, allowed_values, &blk)
    #   additional_checks.call("node", "err_callback")
      @arg_def_list[arg_name.to_sym] = ArgumentSpecification.new(arg_name,
                                                                 allowed_values,
                                                                 blk)
      self
    end
    #TODO : These names are all JS case!
    def fetchNode(name)
      @node_def_list[name.to_sym] or raise "CANT FIND NODE SPEC"
    end

    def defineNode(kind, allowed_args, allowed_body_nodes = [])
      @node_def_list[kind.to_sym] = NodeSpecification.new(kind,
                                                          allowed_args,
                                                          allowed_body_nodes)
      self
    end
  end
end
