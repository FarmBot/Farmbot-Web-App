# A heap-ish data structure required when converting canonical CeleryScript AST
# nodes in the the Flat IR form.
# This data strcutre is useful because it addresses each node in the
# CeleryScript tree via a unique numerical index, rather than using mutable
# references.
# MORE INFO: https://github.com/FarmBot-Labs/Celery-Slicer
class CSHeap
  attr_accessor
    # A single node in the CeleryScript tree, as stored in the heap.
    :entries,
    # "here" represents the last item added to the heap and, often, the item
    # that is currently being edited.
    :here

  # Index 0 of the heap represents a null pointer of sorts. If a field points to
  #
  NULL    = 0

  # What you will find at index 0 of the heap:
  NOTHING = { __KIND__: "nothing" }

  # Set "here" to "null". Prepopulate "here" with an empty entry.
  def initialize
    @here    = CSHeap::NULL
    @entries = { @here => NOTHING }
  end

  # Grow the heap and fill it was a CS node of type `__KIND__`.
  # Returns the new value of `@here` after expansion.
  def allot(__KIND__)
    entries[@here += 1] = { __KIND__: __KIND__ }
    return @here
  end

  # augment a heap entry with a new key/value pair.
  # Throws an exception when given a bad heap index.
  def put(address, key, value)
    block = entries[address]
    if (block)
      block[key] = value
      return
    else
      raise ("Bad node address: " + address)
    end
  end

  # Dump the heap as an easy-to-serialize JSON object.
  # We need this to reconstruct the node from its IR form to its canonical form.
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
            is_primary = key.to_s.starts_with?(Slicer::LINK)
            if is_primary
              clean_key = key.gsub(Slicer::LINK, "")
              output[:primary_nodes][clean_key] = JSON.parse(value)
            else
              output[:edge_nodes][key] = JSON.parse(value)
            end
          end
          output.deep_symbolize_keys
      end
  end
end
