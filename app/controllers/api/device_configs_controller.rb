# Api::DeviceConfigController is the RESTful endpoint for managing key/value
# configuration pairs.
module Api
  class DeviceConfigsController < Api::AbstractController
    def create
      mutate DeviceConfigs::Create.run(params.as_json, device: current_device)
    end

    def index
      render json: configs
    end

    def show
      render json: config
    end

    def update
      mutate DeviceConfigs::Update.run(params.as_json, config: config)
    end

    def destroy
      render json: config.destroy! && ""
    end

  private

    def config
      configs.find(params[:id])
    end

    def configs
      current_device.device_configs
    end
  end
end
