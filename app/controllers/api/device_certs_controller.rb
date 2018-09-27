module Api
  class DeviceCertsController < Api::AbstractController
    def create
      mutate DeviceCerts::Create.run(raw_json, device: current_device)
    end
  end
end
