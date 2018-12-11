module Fragments
  class Create < Mutations::Command
    H      = CeleryScript::HeapAddress
    BLANK  = ""
    BODY   = "__body"
    KIND   = "__KIND__"
    NAME   = "name"
    NEXT   = "__next"
    PARENT = "__parent"
    US     = "__"
    KINDS  = \
    CeleryScriptSettingsBag::Corpus.as_json[:nodes].pluck(NAME).sort.map(&:to_s)

    required do
      model :device, class: Device
      array :proto_nodes do
        hash { duck :*, methods: [] }
      end
    end

    def execute
      proto_nodes.each_with_index do |flat_node, index|
        node = nodes.fetch(index)
        flat_node.without(KIND).map do |(k,v)|
          if k.starts_with?(US)
            case k
            when PARENT then nodes.fetch(index).parent = nodes.fetch(v.value)
            when NEXT   then nodes.fetch(index).next   = nodes.fetch(v.value)
            when BODY   then nodes.fetch(index).body   = nodes.fetch(v.value)
            else
              arg_name = ArgName.cached_by_value(k.gsub(US, BLANK))
              new_standard_pair(fragment: fragment,
                                arg_set:  node.arg_set,
                                arg_name: arg_name,
                                node:     node)
            end
          end
        end
      end

      Node.transaction do
        nodes.map(&:save!)
        @primitive_pairs.map(&:save!)
        @standard_pairs.map(&:save!)
      end
      fragment
    end

    def nodes
      @nodes ||= proto_nodes.map do |flat_node|
        kind      = Kind.cached_by_value(flat_node.fetch(KIND))
        real_node = Node.new(kind:     kind,
                             fragment: fragment,
                             parent:   null_node,
                             next:     null_node,
                             body:     null_node,)
        arg_set   = ArgSet.new(node: real_node, fragment: fragment)
        flat_node.without(KIND).map do |(k,v)|
           if !k.starts_with?(US)
            arg_name = ArgName.cached_by_value(k.gsub(US, BLANK))
            primitive = primitives.fetch(v) do
              primitives[v] = Primitive.find_or_create_by(value: v, fragment: fragment)
            end
            new_primitive_pair(arg_name:  arg_name,
                               arg_set:   arg_set,
                               primitive: primitive,
                               fragment:  fragment)
           end
          end
        real_node
      end
    end

    def new_standard_pair(args)
      @standard_pairs ||= []
      @standard_pairs.push(StandardPair.new(args))
    end

    def new_primitive_pair(args)
      @primitive_pairs ||= []
      @primitive_pairs.push(PrimitivePair.new(args))
    end

    def primitives
      @primitives ||= {}
    end

    def fragment
      @fragment ||= Fragment.new(device: device)
    end

    def null_node
      @null_node ||= Node.new(kind: Kind.cached_by_value("nothing"), fragment: fragment)
    end
  end
end
