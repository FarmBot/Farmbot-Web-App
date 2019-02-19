# Define how a particular argument should behave in a corpus.
# Remember: In CeleryScript, and arg is a `key` (string) and a `value` (either
# a primitive data type or a fully-formed CS node)
module CeleryScript
  class EnumSpecification
    attr_reader :name, :allowed_values
    def initialize(name, allowed_values)
      @name           = name
      @allowed_values = allowed_values
    end

    def as_json(optns)
      {
        "name"           => name,
        "allowed_values" => allowed_values.uniq
      }
    end
  end
end
