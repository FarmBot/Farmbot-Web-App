# A heap-ish data structure required when converting canonical CeleryScript AST
# nodes into the Flat IR form.
# This data structure is useful because it addresses each node in the
# CeleryScript tree via a unique numerical index, rather than using mutable
# references.
# MORE INFO: https://github.com/FarmBot-Labs/Celery-Slicer
module CeleryScript
  class HeapAddress
    attr_reader :value

    def initialize(value)
      raise "BAD INPUT" unless value.is_a?(Integer)
      @value = value.to_i
    end

    def self.[](value)
      return self.new(value)
    end

    def inspect
      "HeapAddress(#{value})"
    end

    def hash
      self.value
    end

    def ==(other)
      self.value == other.value
    end

    def eql?(other)
      self.value == other.value
    end

    def +(val)
      HeapAddress[@value + 1]
    end

    def -(val)
      HeapAddress[@value - 1]
    end

    def is_address?
      true
    end

    def to_i
      @value
    end

    def to_s
      @value.to_s
    end
  end

  class CSHeap
    # Nodes that point to other nodes rather than primitive data types (eg:
    # `locals` and friends) will be prepended with a "🔗".
    LINK   = "__"
    # Points to the originator (parent) of an `arg` or `body` node.
    PARENT = (LINK + "parent").to_sym
    # Points to the first element in the `body``
    BODY   = (LINK + "body").to_sym
    # (Broke?) Points to the next node in the body chain. Pointing to NOTHING
    # indicates the end of the body linked list.
    NEXT   = (LINK + "next").to_sym
    # Unique key name. See `celery_script_settings_bag.rb`
    KIND   = :__KIND__

    # Keys that primary nodes must have
    PRIMARY_FIELDS = [PARENT, BODY, KIND, NEXT]

    # Index 0 of the heap represents a null pointer of sorts. If a field points to
    # this address, it is considered empty.
    NULL    = HeapAddress[0]

    # What you will find at index 0 of the heap:
    NOTHING = {
      KIND   => "nothing",
      PARENT => NULL,
      BODY   => NULL,
      NEXT   => NULL
    }


    # A dictionary of nodes in the CeleryScript tree, as stored in the heap.
    # It's a collection of key/value pairs, a parent index, a body index and a
    # __KIND__ key.
    attr_accessor :entries

    # "here" represents the last item added to the heap and, often, the item that
    # is currently being edited.
    attr_accessor :here

    # Set "here" to "null". Prepopulates "here" with an empty entry.
    def initialize
      @here    = NULL
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
      address.is_address?
      block = entries[address]
      if (block)
        block[key.to_sym] = value
        return
      else
        raise ("Bad node address: " + address)
      end
    end

    # Just an alias
    def values
      entries.values
    end

    # Dump the heap as an easy-to-traverse JSON object.
    # We need this to reconstruct the node from its IR form to its canonical form.
    def dump
      return values
    end
  end
end
