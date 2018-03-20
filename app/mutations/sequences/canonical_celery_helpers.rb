module Sequences
  module CanonicalCeleryHelpers
    refine Mutations::HashFilter do
      def color
        string :color, in: Sequence::COLORS
      end

      def args
        hash :args do
          optional do
            hash :locals do
              # Let CeleryScript lib do the type checking...
              duck :*, methods: []
            end
          end
        end
      end

      def body
        duck :body, methods: [:[], :[]=, :each, :map]
      end
    end
  end
end
