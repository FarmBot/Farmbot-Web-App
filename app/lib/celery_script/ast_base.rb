# Base calss for every "thing" that is found in a CeleryScript AST.
module CeleryScript
  # Abstract class that AstLeaf and AstNode inherit from.
  # Use this for shared leaf/node behavior.
  class AstBase
    def invalidate!(message = "Unspecified type check error.")
      raise CeleryScript::TypeCheckError, message
    end
  end
end
