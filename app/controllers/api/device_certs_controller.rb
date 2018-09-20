module Api
  class DeviceCertsController < Api::AbstractController
    def show
      render json: {finish: :this}
    end

    def create
      mutate DeviceCerts::Create.run(raw_json, device: current_device)
    end

private

  end
end
