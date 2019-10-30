module CeleryScript
  # THIS IS A MORE MINIMAL VERSION OF CeleryScript::TreeClimber.
  # It is a NON-VALIDATING tree climber.
  # Don't use this on unverified data structures.
  class JsonClimber
    HASH_ONLY = "Expected a Hash."
    NOT_NODE = "Expected hash with at least a `kind` and `args` prop."

    def self.climb(thing, &callable)
      raise HASH_ONLY unless thing.is_a?(Hash)
      raise NOT_NODE unless is_node?(thing)
      go(thing, callable)
      thing
    end

    private

    def self.is_node?(maybe)
      maybe.is_a?(Hash) &&
      maybe.keys.include?(:kind) &&
      maybe.keys.include?(:args)
    end

    def self.go(thing, callable)
      if is_node?(thing)
        callable.call(thing)

        # Recurse into each arg
        thing[:args].map { |x| go(x.last, callable) }

        # Maybe recurse into body.
        (thing[:body] || []).each { |x| go(x, callable) }
      end
    end
  end
end
