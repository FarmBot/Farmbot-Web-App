module CeleryScript
  class NodeDeclaration
    attr_reader :kind, :args, :body, :validator

    UNKNOWN_ARG_TYPE = "Node contains unrecognized arg attributes "
    MISSING_ARG      = "Node is miss arg attribute "


    def initialize(kind, args, body, validator = nil)
      @kind, @args, @body, @validator = kind, args, body, validator
    end

    def validate(node, corpus, problem)
      args.each do |arg_type|
        ad = corpus.fetchArgDeclaration(arg_type)
        if !ad
          problem.call(node, UNKNOWN_ARG_TYPE)
        else
          ad.types.each do |type|
            if (type.is_a?(Class))
            else
              val = node.args[type.to_sym]
              return problem.call(node, MISSING_ARG + type.to_s) unless val
              binding.pry
              validate(val, corpus, problem)
              # TODO: Call custom validator here?
            end
          end
        end
      end
      # (Recursively?) Check body types
      body.each do |kind|
      end
    end
  end
end

