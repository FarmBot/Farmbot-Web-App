module Regimens
  class Delete < Mutations::Command
    IN_USE = "In use by the following farm events: "

    required do
      model :device, class: Device
      model :regimen, class: Regimen
    end

    def validate
      check_if_any_farm_events_using_this
    end

    def execute
       regimen.destroy!
       return ""
    end

  private

    def check_if_any_farm_events_using_this
      fes = FarmEvent.still_using(regimen)
      if fes.any?
        msg = IN_USE % [ fes.pluck(:name).uniq.join(", ") ]
        add_error(:regimen, :required, msg)
      end
    end
  end
end
