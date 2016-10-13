module CeleryScript
  class ArgumentDeclaration
    attr_reader :name, :types, :validator

    def initialize(name, types, validator = nil)
      @name, @types, @validator = name, types, validator
    end

    def validate(node)
      raise "Pending."
    end
  end
end

