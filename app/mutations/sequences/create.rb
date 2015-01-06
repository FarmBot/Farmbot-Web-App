module Sequences
  class Create < Mutations::Command

    required do
      model  :user
      string :name
      array(:steps) { model :step, builder: Steps::Create, class: Object }
    end

    def validate
    end

    def execute
      {}
    end
  end
end
