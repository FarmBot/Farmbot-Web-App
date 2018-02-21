# A Corpus is a dictionary describing every kind of node and argument that is
# allowed in the abstract syntax tree.
module CeleryScript
  class Corpus
    BAD_NODE_NAME = "Can't find validation rules for node "
    NO_ARG_SPEC   = "CANT FIND ARG SPEC"
    NO_NODE_SPEC  =

    def initialize
      @arg_def_list  = HashWithIndifferentAccess.new
      @node_def_list = HashWithIndifferentAccess.new
    end

    def fetchArg(name)
      @arg_def_list[name] or raise NO_ARG_SPEC
    end

    def fetchNode(name)
      n = @node_def_list[name]
      n ? n : raise(TypeCheckError, BAD_NODE_NAME + name.to_s)
    end

    def arg(arg_name, allowed_values, &blk)
      @arg_def_list[arg_name] = \
        ArgumentSpecification.new(arg_name, allowed_values, blk)
      self
    end

    def node(kind, allowed_args, allowed_body_nodes = [], &blk)
      @node_def_list[kind] = \
        NodeSpecification.new(kind, allowed_args, allowed_body_nodes, blk)
      self
    end

    # List of allowed arg types for a node.
    def args(node)
      fetchNode(node.kind).allowed_args
    end

    # List of allowed values for a node
    def values(node)
      fetchArg(node.kind).allowed_values
    end

    # List of allowed body node types within a node
    def bodies(node)
      Array(fetchNode(node.kind).allowed_body_types).map(&:to_sym)
    end

    # Grab validator for a fully formed node.
    def validate_node(node)
      defn = @node_def_list[node.kind] or raise(TypeCheckError,
                                                BAD_NODE_NAME + name.to_s)
      defn.additional_validation&.call(node)
    end

    # Grabs validator for an __ARG__ type.
    def arg_validator(name)
      fetchArg(name).additional_validation || CeleryScript::NOOP
    end

    def as_json(*)
      { "tag": Sequence::LATEST_VERSION,
        "args": @arg_def_list.to_a.map(&:last).map{|x| x.as_json({}) },
        "nodes": @node_def_list.to_a.map(&:last).map{|x| x.as_json({}) }}
    end
  end
end
