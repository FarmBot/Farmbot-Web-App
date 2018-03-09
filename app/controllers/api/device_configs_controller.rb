# Api::DeviceConfigController is the RESTful endpoint for managing key/value
# configuration pairs.
module Api
  class DeviceConfigsController < Api::AbstractController

    def create
      mutate DeviceConfigs::Create.run(params.as_json, device: current_device)
    end

    def index
      render json: device_configs
    end

    def update
      mutate DeviceConfigs::Update.run(raw_json, config: device_config)
    end

    def destroy
      render json: (device_config.destroy! && "")
    end

  private

    def device_config
      device_configs.find(params[:id])
    end

    def device_configs
      current_device.device_configs
    end
  end
end
