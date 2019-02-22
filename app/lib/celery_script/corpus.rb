# A Corpus is a dictionary describing every kind of node and argument that is
# allowed in the abstract syntax tree. Very similar to the a "grammar" in
# parser generators (but not exactly).
module CeleryScript
  class Corpus
    class ArgAtom
      attr_reader :tag, :name
      def initialize(tag)
        @tag  = tag
        @name = tag.to_s
      end
    end

    class Enum < ArgAtom
      def valid?(node, corpus)
        # TODO: Clean this up to actually use encapsulation.
        spec      = corpus.instance_variable_get(:@enum_def_list).fetch(tag)
        value     = node.value
        whitelist = spec.allowed_values
        if whitelist.include?(value)
          return true
        else
          msg = spec.error_template % [value, whitelist]
          raise CeleryScript::TypeCheckError, msg
        end
      end
    end

    class Value < ArgAtom
      def initialize(tag)
        super(tag)
        @name = @name.capitalize
      end

      def valid?(node, corpus)
        return corpus # TODO: Clean this up to actually use encapsulation.
          .instance_variable_get(:@value_def_list)
          .fetch(tag)
          .values
          .include?(node.value.class)
      end
    end

    class Node < ArgAtom
      def valid?(node, _corpus)
        return node.kind == tag
      end
    end


    ATOMS         = [Enum, Value, Node]
    BAD_NODE_NAME = "Can't find validation rules for node "
    NO_ARG_SPEC   = "CANT FIND ARG SPEC"
    NO_NODE_SPEC  = "NO_NODE_SPEC"

    def initialize
      @arg_def_list   = HashWithIndifferentAccess.new
      @node_def_list  = HashWithIndifferentAccess.new
      @enum_def_list  = HashWithIndifferentAccess.new
      @value_def_list = HashWithIndifferentAccess.new
    end

    def fetchArg(name)
      @arg_def_list[name] or raise NO_ARG_SPEC
    end

    def fetchNode(name)
      n = @node_def_list[name]
      n ? n : raise(TypeCheckError, BAD_NODE_NAME + name.to_s)
    end

    def enum(name, whitelist, error_template_string)
      @enum_def_list[name] = EnumSpecification.new(name, whitelist, error_template_string)
      self
    end

    def value(name, defn)
      @value_def_list[name] = ValueSpecification.new(name, defn)
      self
    end

    def arg(name, defn, &blk)
      @arg_def_list[name] = ArgumentSpecification.new(name, defn, blk)
      self
    end

    def node(kind, args: [], body: [], tags: [], docs: nil, blk: nil)
      @node_def_list[kind] = \
        NodeSpecification.new(kind, args, body, tags, docs, blk)
      self
    end

    # List of allowed arg types for a node.
    def args(node)
      fetchNode(node.kind).allowed_args
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
      ({
        version: Sequence::LATEST_VERSION,
        enums:   @enum_def_list.values.map  { |x| x.as_json({}) },
        values:  @value_def_list.values.map { |x| x.as_json({}) },
        args:    @arg_def_list.values.map   { |x| x.as_json({}) },
        nodes:   @node_def_list.values.map  { |x| x.as_json({}) },
      })
    end
  end
end
