module CeleryScript
  class ArgumentSpecification
    attr_reader :name, :allowed_values, :additional_validation
    NOOP = ->(_, __) { }

    def initialize(name, allowed_values, additional_validation = NOOP)
      @name                  = name
      @allowed_values        = allowed_values
      @additional_validation = additional_validation
    end

    # PROBLEM: Ruby calls them "Fixnum"s, but the world calls them "integers"
    # SOLUTION: Add a dictionary of special rules.
    def serialize_allowed_value(v)
      { String => "string",
        Fixnum => "integer" }[v] || v
    end

    def as_json(optns)
      {
        "name"           => name,
        "allowed_values" => allowed_values.map { |av| serialize_allowed_value(av) }
      }
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
    BAD_NODE_NAME = "Can't find validation rules for node "
    NO_ARG_SPEC   = "CANT FIND ARG SPEC"
    def initialize
      @arg_def_list = {}
      @node_def_list = {}
    end

    def fetchArg(name)
      @arg_def_list[name.to_sym] or raise NO_ARG_SPEC
    end

    def defineArg(arg_name, allowed_values, &blk)
      @arg_def_list[arg_name.to_sym] = ArgumentSpecification.new(arg_name,
                                                                 allowed_values,
                                                                 blk)
      self
    end

    def fetchNode(name)
      n = @node_def_list[name.to_sym]
      n ? n : raise(TypeCheckError, BAD_NODE_NAME + name.to_s)
    end

    def defineNode(kind, allowed_args, allowed_body_nodes = [])
      @node_def_list[kind.to_sym] = NodeSpecification.new(kind,
                                                          allowed_args,
                                                          allowed_body_nodes)
      self
    end

    def as_json(optns)
      { "tag": SequenceMigration::Base.latest_version,
        "args": @arg_def_list.to_a.map(&:last).map{|x| x.as_json({}) },
        "nodes": @node_def_list.to_a.map(&:last).map{|x| x.as_json({}) }}
    end
  end
end
