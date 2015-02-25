require 'mutations/time_filter'

module Schedules
  class Create < Mutations::Command
    using MongoidRefinements

    required do
      model :sequence, class: Sequence
      model :user, class: User
      integer :repeat
      string :time_unit, in: Schedule::UNITS_OF_TIME
    end

    optional do
      time :start_time, default: Time.current
      time :end_time
    end

    def execute
      create(Schedule, inputs) do |sched|
        sched.next_time = sched.calculate_next_occurence
      end
    end
  end
end
