module Api
  class DeviceCertsController < Api::AbstractController
    def create
      mutate DeviceCerts::Create.run(params.as_json, device: current_device)
    end

private

  end
end
