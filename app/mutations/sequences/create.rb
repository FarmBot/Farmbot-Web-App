module Sequences
  class Create < Mutations::Command

    required do
      model :user
      string :time_stamp
      array(:steps) do
        model :step, builder: Steps::Create
      end
    end

    def validate
    end

    def execute
      {}
    end
  end
end
