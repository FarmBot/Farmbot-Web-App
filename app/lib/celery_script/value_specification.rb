module CeleryScript
  class ValueSpecification
    attr_reader :name, :values

    def initialize(name, values)
      @name   = name
      @values = values
    end

    def as_json(optns)
      { "name" => name }
    end
  end
end
