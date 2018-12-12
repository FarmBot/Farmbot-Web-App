module Fragments
  # class Cacher
  #   MAP = {
  #     node: {
  #       arg_set: {
  #         standard_pairs:  {},
  #         primitive_pairs: {},
  #       },
  #       body: {},
  #       kind: {},
  #       next: {},
  #     },
  #     primitive_pair: {
  #       arg_name: {
  #         value: {}
  #       },
  #       node: {}
  #     },
  #     standard_pairs: {

  #     },
  #   }

  #   def initialize(fragment)
  #   end

  #   # node.arg_set.primitive_pairs
  #   def get_XYZ()
  #   end

  #   # node.arg_set.standard_pairs
  #   def get_XYZ()
  #   end

  #   # node.body
  #   def get_XYZ()
  #   end

  #   # node.kind.value
  #   def get_XYZ()
  #   end

  #   # node.kind
  #   def get_XYZ()
  #   end

  #   # node.next
  #   def get_XYZ()
  #   end

  #   # primitive_pair.arg_name.value
  #   def get_XYZ()
  #   end

  #   # primitive_pair.node
  #   def get_XYZ()
  #   end

  #   # standard_pairs.arg_name.value
  #   def get_XYZ()
  #   end

  #   # standard_pairs.node
  #   def get_XYZ()
  #   end
  # end

  class Show < Mutations::Command
    ENTRY    = "internal_entry_point"
    required do
      integer :fragment_id
      model   :device, class: Device
    end

    def validate
    end

    def execute
      index_things_in_memory
      node2cs(entry_node.next)
    end

  private

    def index_things_in_memory
      # nodes.map do |node| node.arg_set end
      binding.pry
    end

    def node2cs(node)
      standard  = node.arg_set.standard_pairs.reduce({}) do |acc, item|
        acc[item.arg_name.value] = node2cs(item.node)
        acc
      end

      primitive = node.arg_set.primitive_pairs.reduce({}) do |acc, item|
        acc[item.arg_name.value] = item.primitive.value
        acc
      end

      result = { kind: node.kind.value,
                 args: primitive.merge(standard),
                 body: recurse_into_body(node.body) }
      result.delete(:body) if result[:body].length == 0
      result
    end

    def recurse_into_body(node, body = [])
      unless [Kind.nothing, Kind.entry_point].include?(node.kind)
        body.push(node2cs(node))
        recurse_into_body(node.next, body)
      else
        body
      end
    end

    def entry_node
      # .preload(Fragment::EVERYTHING)
      @entry_node ||= nodes.find_by(kind: Kind.cached_by_value(ENTRY))
    end

    def nodes
      @nodes ||= fragment.nodes
    end

    def fragment
      @fragment ||= device.fragments.preload(Fragment::EVERYTHING).find(fragment_id)
    end
  end
end
