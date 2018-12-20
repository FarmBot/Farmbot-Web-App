# A heap-ish data structure required when converting canonical CeleryScript AST
# nodes into the Flat IR form.
# This data structure is useful because it addresses each node in the
# CeleryScript tree via a unique numerical index, rather than using mutable
# references. This is very important when:
#   * You are using a (functional) language that does not like mutable refs
#   * You are storing data in a database that does not like
#     trees (SQL, not Mongo)
#   * You need to create "traces" of where you are in a sequence (using numbers)
# MORE INFO: https://github.com/FarmBot-Labs/Celery-Slicer
module CeleryScript
  # Supporting class for CSHeap (below this class)
  # PROBLEM:  CSHeap uses numbers to address sibling/parent nodes.
  # PROBLEM:  Numbers are very easy to mix up. Is it an array index? A SQL
  #           primary key? A primitive value? It's not always easy to say.
  # SOLUTION: Create a `HeapAddress` value type to remove ambiguity.
  #           Prevents confusion between index IDs and SQL IDs.
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
      self.value == other.try(:value)
    end

    def eql?(other)
      self.value == other.value
    end

    def +(val)
      HeapAddress[@value + 1]
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
    class BadAddress < Exception; end;
    BAD_ADDR = "Bad node address: "
    # Nodes that point to other nodes rather than primitive data types (eg:
    # `locals` and friends) will be prepended with a LINK.
    LINK    = "__"
    # Points to the originator (parent) of an `arg` or `body` node.
    PARENT  = (LINK + "parent").to_sym
    # Points to the first element in the `body``
    BODY    = (LINK + "body").to_sym
    # Points to the next node in the body chain. Pointing to NOTHING indicates
    # the end of the body linked list.
    NEXT    = (LINK + "next").to_sym
    # Unique key name. See `celery_script_settings_bag.rb`
    KIND    = :__KIND__
    COMMENT = :__COMMENT__

    # Keys that primary nodes must have
    PRIMARY_FIELDS = [PARENT, BODY, KIND, NEXT, COMMENT]

    # Index 0 of the heap represents a null pointer of sorts.
    # If a field points to this address, it is considered empty.
    NULL    = HeapAddress[0]

    # What you will find at index 0 of the heap:
    NOTHING = {
      KIND   => "nothing",
      PARENT => NULL,
      BODY   => NULL,
      NEXT   => NULL
    }


    # A dictionary of nodes in the CeleryScript tree, as stored in the heap.
    # Nodes will have:
    #   * A `KIND` field   - What kind of node is it?
    #                        `send_message`, `move_rel`, etc..
    #   * A `PARENT` field - The node directly above the current node.
    #   * A `BODY` field   - If a node has a body member (and it might not!),
    #                        this field will point to the first node in the
    #                        chain. NOTHING pointer indicates that the node has
    #                        no body.
    #   * A `NEXT` field   - If you are inside a node's BODY, the next node in
    #                        chain is denoted by the address of NEXT. A NEXT
    #                        value of NOTHING means you hit the end of the chain
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
    # "Create a new empty heap object and return its address for access later"
    def allot(__KIND__)
      entries[@here += 1] = { KIND => __KIND__ }
      return @here
    end

    # augment a heap entry with a new key/value pair.
    # Throws an exception when given a bad heap index.
    # "Put this VALUE into this ADDRESS and annotate it with the KEY provided"
    def put(address, key, value)
      address.is_address?
      block = entries[address]
      if (block)
        block[key.to_sym] = value
        return
      else
        raise BadAddress, BAD_ADDR + address.inspect
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
