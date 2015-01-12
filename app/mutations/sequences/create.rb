module Sequences
  class Create < Mutations::Command
    using MongoidRefinements

    required do
      model :user, class: User
      string :name
      array :steps do
        model :step, builder: Steps::Initialize, new_records: true
      end
    end

    optional do
      string :color, in: Sequence::COLORS
    end

    def execute
      create(Sequence, inputs)
    end
  end
end
