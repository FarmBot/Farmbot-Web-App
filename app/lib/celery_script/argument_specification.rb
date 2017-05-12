# Define how a particular argument should behave in a corpus.
module CeleryScript
  NOOP = ->(*_) { }
  class ArgumentSpecification
    attr_reader :name, :allowed_values, :additional_validation

    def initialize(name, allowed_values, additional_validation = NOOP)
      @name                  = name
      @allowed_values        = allowed_values
      @additional_validation = additional_validation
    end

    # PROBLEM: Ruby calls them "TrueClass" and "FalseClass", everyone else calls
    # it "boolean".
    # SOLUTION: Add a dictionary of special rules.
    def serialize_allowed_value(v)
      { String     => "string",
        Integer    => "integer",
        TrueClass  => "boolean",
        FalseClass => "boolean", }[v] || v
    end

    def as_json(optns)
      {
        "name"           => name,
        "allowed_values" => allowed_values.map { |av| serialize_allowed_value(av) }.uniq
      }
    end
  end
end
