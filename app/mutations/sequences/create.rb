module Sequences
  class Create < Mutations::Command
    required do
      model :device, class: Device
      string :name
    end

    optional do
      string :color, in: Sequence::COLORS
    end

    def execute
      Sequence.create!(inputs)  
    end
  end
end
