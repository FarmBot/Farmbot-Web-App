module Fragments
  class Show < Mutations::Command
    ENTRY = "internal_entry_point"

    required do
      integer :fragment_id
      model :device, class: Device
    end

    def validate
    end

    def execute
      binding.pry
    end

  private

    def entry_node
      @entry_node ||= fragment.nodes.find_by(kind: Kind.cached_by_value(ENTRY))
    end

    def node_index
      @node_index ||= fragment.nodes.index_by(&:id)
    end

    def fragment
      @fragment ||= device.fragments.find(fragment_id)
    end
  end
end
