module Steps
  class Create < Mutations::Command

    required do
      string :message_type, in: Step::MESSAGE_TYPES
      date :time_stamp
      hash(:command) { :* }
      model :sequence
    end

    def validate
    end

    def execute
      # STILL NEED TO:
      # * Make the steps mutation create a step
      # * Make the sequence mutation create one, too.
      binding.pry
    end
  end
end
