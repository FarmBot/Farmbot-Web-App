# Describes the allowed arguments and body types of CeleryScript node.
# Eg: Which arguments does it take? Whic nodes can be placed in the body field?
module CeleryScript
  class NodeSpecification
    attr_reader :name, :allowed_args, :allowed_body_types

    def initialize(name, allowed_args, allowed_body_types)
      @name                  = name
      @allowed_args          = allowed_args
      @allowed_body_types    = allowed_body_types
    end
  end
end
