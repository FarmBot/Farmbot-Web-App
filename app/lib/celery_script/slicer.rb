require_relative "./csheap"
# ORIGINAL IMPLEMENTATION HERE: https://github.com/FarmBot-Labs/Celery-Slicer
# Take a nested ("canonical") representation of a CeleryScript sequence and
# transofrms it to a flat/homogenous intermediate representation which is better
# suited for storage in a relation database.
module CeleryScript
  class Slicer
    # Nodes that point to other nodes rather than primitive data types (eg:
    # `locals` and friends) will be prepended with a "🔗".
    LINK   = "🔗"
    # Points to the originator of an `arg` or `body` node.
    PARENT = LINK + "parent"
    BODY   = LINK + "body_starts_at"
    NEXT   = LINK + "next_body_item"
    KIND   = :__KIND__

    # Keys that primary nodes must have
    PRIMARY_FIELDS = [PARENT, BODY, KIND]

    def run!(node)
      raise "Not a hash" unless node.is_a?(Hash)
      heap = CSHeap.new()
      allocate(heap, node, CSHeap::NULL)
      @heap_values = heap.values
      heap.dump()
    end

    def isCeleryScript(node)
      node && node.is_a?(Hash) && node[:args] && node[:kind]
    end

    def heap_values
      @heap_values
    end

    def allocate(h, s, parentAddr)
      addr = h.allot(s[:kind])
      h.put(addr, PARENT, parentAddr.to_json)
      iterateOverBody(h, s, addr)
      iterateOverArgs(h, s, addr)
      addr
    end

    def iterateOverArgs(h, s, parentAddr)
      (s[:args] || {})
        .keys
        .map do |key|
          v = s[:args][key]
          if (isCeleryScript(v))
            k = LINK + key.to_s
            h.put(parentAddr, k, allocate(h, v, parentAddr).to_json)
          else
              h.put(parentAddr, key, v.to_json)
          end
        end
    end

    def iterateOverBody(heap, s, parentAddr)
      body = (s[:body] || []).map(&:deep_symbolize_keys)
      body.present? && heap.put(parentAddr, BODY, "" + (parentAddr + 1).to_s)
      recurse_into_body(heap, 0, parentAddr, body)
    end

    def recurse_into_body(heap, index, parent, list)
      if list[index]
        me           = allocate(heap, list[index], parent)
        next_index   = index + 1
        next_item    = list[next_index]
        next_address = (next_item) ? (me + 1) : 0
        heap.put(me, NEXT, "" + next_address.to_s)
        recurse_into_body(heap, next_index, me, list)
      end
    end
  end
end