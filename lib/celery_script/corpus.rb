module CeleryScript
  class Corpus
    attr_reader :node_declarations, :arg_declarations

    def initialize
      @node_declarations = {}
      @arg_declarations = {}
    end

    def fetchNodeDeclaration(name)
      node_declarations[name.to_s]    
    end

    def fetchArgDeclaration(name)
      arg_declarations[name.to_s]    
    end

    def defineArg(name, types, &validator)
      pd = ArgumentDeclaration.new(name, types, validator)
      arg_declarations[pd.name.to_s] = pd
      self
    end

    def defineNode(kind, args, body = [], &validator)
      nd = NodeDeclaration.new(kind, args, body, &validator)
      node_declarations[nd.kind.to_s] = nd
      self
    end

    def removeNode(kind)
        node_declarations.delete(kind)
        self
    end

    def removearg(name)
        node_declarations.delete(name)
        self
    end
  end
end
