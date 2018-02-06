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
      binding.pry if heap.entries.keys.length > 5
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
      h.put(addr, CSHeap::PARENT, parentAddr)
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
            h.put(parentAddr, k, allocate(h, v, parentAddr))
          else
            h.put(parentAddr, key, v)
          end
        end
    end

    def iterate_over_body(heap, s, parentAddr)
      puts "Is this a good place to set the `next` address?"
      body = (s[:body] || []).map(&:deep_symbolize_keys)
      !body.none? && heap.put(parentAddr, CSHeap::BODY, parentAddr + 1)
      recurse_into_body(heap, 0, parentAddr, CSHeap::NULL, body)
    end

    def recurse_into_body(heap, index, parent, previous_address, list)
      if list[index]
        # Allocate a cell in the heap for the current node (list[index])
        my_heap_address  = allocate(heap, list[index], parent)
        # Calculate our next node's heap address
        previous_index = index - 1
        # Grab the next item in the canonical list of body items.
        # next_array_index = list[next_index]

        # If it's null, set it to a "nothing" node.
        # If there's still more stuff in the array, set the address to my_heap_address + 1
        #   basically, prep for allocating room for the next item.
        # next_heap_address = (next_array_index) ? (my_heap_address + 1) : CSHeap::NULL

        if previous_index >= 0
          previous_array_entry = list[previous_index]
          binding.pry
          previous_heap_address = my_heap_address - 1
          heap.put(previous_heap_address, CSHeap::NEXT, previous_heap_address)
        end
        # Go ahead and allocate space for the next item if required.
        # heap.put(my_heap_address, CSHeap::NEXT, next_heap_address)

        # Recurse into th node to set appropriate key/val pairs.
        next_index     = index + 1
        recurse_into_body(heap, next_index, my_heap_address, previous_address, list)
      end
    end
  end
end
