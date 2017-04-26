module Regimens
  class Destroy < Mutations::Command
    required do
      model :device, class: Device
      model :regimen, class: Regimen
    end

    def validate
      FarmEvent.if_still_using(regimen) do
        add_error :regimen, :required, FarmEvent::IN_USE
      end
    end

    def execute
       regimen.destroy!
       return ""
    end
  end
end
