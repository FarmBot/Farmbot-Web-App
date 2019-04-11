module Enigmas
  class Destroy < Mutations::Command
    required do
      model :enigma
    end

    def execute
      enigma.destroy!
    end
  end
end
