module Fragments
  class Show < Mutations::Command
    ENTRY    = "internal_entry_point"

    required do
      integer :fragment_id
      model   :device, class: Device
    end

    def execute
      node2cs(cache.get_next(entry_node))
    end

  private

    def node2cs(node)
      standard  = cache.get_standard_pairs(node)
                       .reduce({}) do |acc, (key, value)|
                         acc[key] = node2cs(value)
                         acc
                       end
      result = { kind: cache.kind(node).value,
                 args: cache.get_primitive_pairs(node).merge(standard),
                 body: recurse_into_body(cache.get_body(node)) }
      result.delete(:body) if result[:body].length == 0
      result
    end

    def recurse_into_body(node, body = [])
      unless [Kind.nothing, Kind.entry_point].include?(cache.kind(node))
        body.push(node2cs(node))
        recurse_into_body(cache.get_next(node), body)
      else
        body
      end
    end

    def entry_node
      @entry_node ||= nodes.find_by(kind: Kind.cached_by_value(ENTRY))
    end

    def nodes
      @nodes ||= fragment.nodes
    end

    def fragment
      @fragment ||= device.fragments.preload(Fragment::EVERYTHING).find(fragment_id)
    end

    def cache
      @cache ||= Cache.new(fragment)
    end
  end
end
