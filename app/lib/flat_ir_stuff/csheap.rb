class CSHeap
  attr_accessor :entries, :here

  NULL    = 0
  NOTHING = { __KIND__: "nothing" }

  def initialize
    @here    = CSHeap::NULL
    @entries = { @here => NOTHING }
  end

  def allot(__KIND__)
    entries[@here += 1] = { __KIND__: __KIND__ }
    return @here
  end

  def put(address, key, value)
    block = entries[address]
    if (block)
      block[key] = value
      return
    else
      raise ("Bad node address: " + address)
    end
  end

  class HeapPair < Pair
    def inspect
      "#{head}(#{tail})"
    end
  end
  class HeapEntry
    attr_reader :parent, :child, :kind, :primary_nodes, :primary_nodes,
                :db_entry
    def inspect
      [ "#<Heap:",
        @db_entry.kind.to_s.camelize,
        " parent=#{parent.inspect}",
        " child=#{child.inspect}",
        " primaries=#{primary_nodes.inspect}",
        # " secondaries=#{primary_nodes.inspect}>",
        " db_entry=#{db_entry}" ].join("")
    end

    def initialize(hash)
      @child         = hash[Slicer::NEXT  ].to_i
      @parent        = hash[Slicer::PARENT].to_i
      @primary_nodes = []
      @db_entry      = PrimaryNode.new(kind: hash[Slicer::KIND])
      hash
        .except(*Slicer::PRIMARY_FIELDS)
        .to_a
        .map do |y|
          is_primary = y.first.to_s.starts_with?(Slicer::LINK)
          is_primary ? add_primary_node(y) : add_edge_node(y)
        end
    end

    def add_primary_node(y)
      @primary_nodes.push(HeapPair[y.first.to_s.gsub(Slicer::LINK, "").to_sym, y.last])
    end

    def add_edge_node(node)
      kind      = node.first
      value     = JSON.parse(node.last)
      edge_node = EdgeNode.new(kind: kind, value: value)
      @db_entry.edge_nodes.push(edge_node)
    end
  end

  def dump
    return entries
      .values
      .map { |x| HeapEntry.new(x) }
  end
end
