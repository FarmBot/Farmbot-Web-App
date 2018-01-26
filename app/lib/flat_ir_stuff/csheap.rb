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

  def dump
    return entries.values
  end
end
