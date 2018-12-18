module Fragments
  class Create < Mutations::Command
    BAD_AST = "Node 0 must be present. Node 0 must be a 'nothing' node."
    BLANK   = ""
    BODY    = "__body"
    ENTRY   = "internal_entry_point"
    KIND    = "__KIND__"
    NAME    = "name"
    NEXT    = "__next"
    PARENT  = "__parent"
    US      = "__"
    NOTHING = "nothing"
    H       = CeleryScript::HeapAddress
    KINDS   = \
    CeleryScriptSettingsBag::Corpus.as_json[:nodes].pluck(NAME).sort.map(&:to_s)

    required do
      model :device, class: Device
      array :flat_ast do
        hash { duck :*, methods: [] }
      end
    end

    def execute
        # LEGACY SHIM:
        #  1. CelerySlicer inserts a `nothing` node at the start of the flat_ast
        #  2. The new Fragment table expects an ENTRY node at position 0 of the
        #     flat_ast
        #  3. This is the fast solution. When all resources switch to the new
        #     `Fragment` table, we can modify the Slicer to use ENTRY at pos 0.
        #  TODO: Store sequence ASTs in fragment table, eventually.
        #          -RC 12 DEC 18
      nodes[0] = entry_node # <= THIS MATTERS
      flat_ast.each_with_index do |flat_node, index|
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
                                node:     nodes.fetch(flat_node.fetch(k).value))
            end
          end
        end
      end

      entry_node.next = nodes.fetch(1)

      Node.transaction do
        nodes.map(&:save!)
        primitive_pairs.map(&:save!)
        standard_pairs.map(&:save!)
      end
      fragment
    end

    def nodes
      @nodes ||= flat_ast.map do |flat_node|
        kind      = Kind.cached_by_value(flat_node.fetch(KIND))
        real_node = Node.new(kind:     kind,
                             fragment: fragment,
                             parent:   entry_node,
                             next:     entry_node,
                             body:     entry_node,)
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
      standard_pairs.push(StandardPair.new(args))
    end

    def new_primitive_pair(args)
      primitive_pairs.push(PrimitivePair.new(args))
    end

    def primitive_pairs
      @primitive_pairs ||= []
    end

    def standard_pairs
      @standard_pairs ||= []
    end

    def primitives
      @primitives ||= {}
    end

    def fragment
      @fragment ||= Fragment.new(device: device)
    end

    def entry_node
      @entry_node ||= Node.new(kind:     Kind.cached_by_value(ENTRY),
                               fragment: fragment)
    end
  end
end
