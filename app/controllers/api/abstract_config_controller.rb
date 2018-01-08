module Api
  class AbstractConfigController < Api::AbstractController
    def show
      render json: current_device
    end

    def update
      mutate Devices::Update.run(params.as_json, device: current_device)
    end

    def destroy
      Devices::Destroy.run!(user: current_user, device: current_device)
      render json: "", status: 204
    end
  end
end
