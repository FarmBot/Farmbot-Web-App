# A Corpus is a dictionary describing every kind of node and argument that is
# allowed in the abstract syntax tree.
module CeleryScript
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

    def arg(arg_name, allowed_values, &blk)
      @arg_def_list[arg_name.to_sym] = ArgumentSpecification.new(arg_name,
                                                                 allowed_values,
                                                                 blk)
      self
    end

    def fetchNode(name)
      n = @node_def_list[name.to_sym]
      n ? n : raise(TypeCheckError, BAD_NODE_NAME + name.to_s)
    end

    def node(kind, allowed_args, allowed_body_nodes = [])
      @node_def_list[kind.to_sym] = NodeSpecification.new(kind,
                                                          allowed_args,
                                                          allowed_body_nodes)
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

    def validator(name)
      fetchArg(name).additional_validation || CeleryScript::NOOP
    end

    def as_json(*)
      { "tag": Sequence::LATEST_VERSION,
        "args": @arg_def_list.to_a.map(&:last).map{|x| x.as_json({}) },
        "nodes": @node_def_list.to_a.map(&:last).map{|x| x.as_json({}) }}
    end
  end
end
