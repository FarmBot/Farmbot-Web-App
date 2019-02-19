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
