module Fragments
  class Show < Mutations::Command
    ENTRY          = "internal_entry_point"
    EMPTY_FRAGMENT = { kind: "internal_farm_event",
                       args: {},
                       body: [] }
    required do
      duck :owner, methods: [:fragment_owner?, :id]
    end

    def execute
      if fragment
        node2cs(cache.get_next(entry_node))
      else
        EMPTY_FRAGMENT
      end
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

    def fragment
      @fragment ||= \
        Fragment.preload(Fragment::EVERYTHING).where(owner: owner).first
    end

    def entry_node
      @entry_node ||= nodes.find_by(kind: Kind.cached_by_value(ENTRY))
    end

    def nodes
      @nodes ||= fragment.nodes
    end

    def cache
      @cache ||= Cache.new(fragment)
    end
  end
end
