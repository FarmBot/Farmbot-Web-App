require_relative "./csheap.rb"
# ORIGINAL IMPLEMENTATION HERE: https://github.com/FarmBot-Labs/Celery-Slicer
# Take a nested ("canonical") representation of a CeleryScript sequence and
# transofrms it to a flat/homogenous intermediate representation which is better
# suited for storage in a relation database.
module CeleryScript
  class Slicer

    def run!(node)
      raise "Not a hash" unless node.is_a?(Hash)
      heap = CSHeap.new()
      allocate(heap, node, CSHeap::NULL)
      @heap_values = heap.values
      heap.dump()
    end

    def is_celery_script(node)
      node && node.is_a?(Hash) && node[:args] && node[:kind]
    end

    def heap_values
      @heap_values
    end

    def allocate(h, s, parentAddr)
      addr = h.allot(s[:kind])
      h.put(addr, CSHeap::PARENT, parentAddr.to_json)
      iterate_over_body(h, s, addr)
      iterate_over_args(h, s, addr)
      addr
    end

    def iterate_over_args(h, s, parentAddr)
      (s[:args] || {})
        .keys
        .map do |key|
          v = s[:args][key]
          if (is_celery_script(v))
            k = CSHeap::LINK + key.to_s
            h.put(parentAddr, k, allocate(h, v, parentAddr).to_json)
          else
              h.put(parentAddr, key, v.to_json)
          end
        end
    end

    def iterate_over_body(heap, s, parentAddr)
      puts "Is this a good place to set the `next` address?"
      body = (s[:body] || []).map(&:deep_symbolize_keys)
      !body.none? && heap.put(parentAddr, CSHeap::BODY, "" + (parentAddr + 1).to_s)
      recurse_into_body(heap, 0, parentAddr, body)
    end

    def recurse_into_body(heap, index, parent, list)
      if list[index]
        # Allocate a cell in the heap for the current node (list[index])
        my_heap_address  = allocate(heap, list[index], parent)
        # Calculate our next node's heap address
        next_index       = index + 1
        # Grab the next item in the canonical list of body items.
        next_array_index = list[next_index]
        # If it's null, set it to a "nothing" node.
        # If there's still more stuff in the array, set the address to my_heap_address + 1
        #   basically, prep for allocating room for the next item.
        next_heap_address = (next_array_index) ? (my_heap_address + 1) : CSHeap::NULL
        # Go ahead and allocate space for the next item if required.
        heap.put(my_heap_address, CSHeap::NEXT, "" + next_heap_address.to_s)
        binding.pry if list.length > 1
        # Recurse into th node to set appropriate key/val pairs.
        recurse_into_body(heap, next_index, my_heap_address, list)
      end
    end
  end
end
