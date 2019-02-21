module CeleryScript
  class EnumSpecification
    attr_reader :name, :allowed_values, :error_template

    def initialize(name, allowed_values, error_template_string)
      @name           = name
      @allowed_values = allowed_values
      @error_template = error_template_string
    end

    def as_json(optns)
      {
        "name"           => name,
        "allowed_values" => allowed_values.uniq
      }
    end
  end
end
