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
    attr_reader :parent, :child, :kind, :primary_args, :secondary_args
    def inspect
      [ "#<Heap:",
        kind.to_s.camelize,
        "parent=#{parent.inspect} ",
        "child=#{child.inspect} ",
        "primaries=#{primary_args.inspect}",
        " secondaries=#{secondary_args.inspect}>" ].join("")
    end

    def initialize(hash)
      @kind           = hash[Slicer::KIND  ].to_sym
      @child          = hash[Slicer::NEXT  ].to_i
      @parent         = hash[Slicer::PARENT].to_i
      @primary_args   = []
      @secondary_args = []
      hash
        .except(*Slicer::PRIMARY_FIELDS)
        .to_a
        .map do |y|
          is_primary = y.first.to_s.starts_with?(Slicer::LINK)
          (is_primary ? @primary_args : @secondary_args)
            .push(HeapPair[y.first.to_s.gsub(Slicer::LINK, "").to_sym, y.last])
        end
    end
  end

  def dump
    return entries
      .values
      .map { |x| HeapEntry.new(x) }
  end
end
