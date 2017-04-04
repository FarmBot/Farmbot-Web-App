module Regimens
  class Delete < Mutations::Command
    IN_USE = "still in use by some farm events"

    required do
      model :device, class: Device
      model :regimen, class: Regimen
    end

    def validate
      FarmEvent.if_still_using(sequence) do
        add_error(:regimen, :required, msg)
      end
    end

    def execute
       regimen.destroy!
       return ""
    end
  end
end
