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
    return entries
      .values
      .map do |input|
        output = {
          kind:   input[Slicer::KIND],
          parent: (input[Slicer::PARENT.to_s] || "0").to_i,
          child:  (input[Slicer::CHILD.to_s ] || "0").to_i,
          primary_nodes:    {},
          edge_nodes:       {}
        }

        input
          .without(Slicer::KIND, Slicer::PARENT, Slicer::CHILD)
          .to_a
          .map do |node|
            key, value = *node
            if key.to_s.starts_with?(Slicer::LINK)
              output[:primary_nodes][key.gsub(Slicer::LINK, "")] = JSON.parse(value)
            else
              output[:edge_nodes][key] = JSON.parse(value)
            end
          end
          output.deep_symbolize_keys
      end
  end
end
