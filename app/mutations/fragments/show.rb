module Fragments
  class Show < Mutations::Command
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

    def nodes
      @nodes ||= fragment.nodes.index_by(&:id)
    end

    def fragment
      @fragment ||= device.fragments.find(fragment_id)
    end
  end
end
