# Api::FarmwareEnvController is the RESTful endpoint for managing key/value
# configuration pairs.
module Api
  # Farmware envs controller handles CRUD for user definable key/value pairs.
  # Usually used for Farmware settings and data.
  class FarmwareEnvsController < Api::AbstractController

    def create
      mutate FarmwareEnvs::Create.run(raw_json, device: current_device)
    end

    def index
      render json: farmware_envs
    end

    def show
      render json: farmware_env
    end

    def update
      mutate FarmwareEnvs::Update.run(raw_json, farmware_env: farmware_env)
    end

    def destroy
      if params[:id] == "all"
        render json: (current_device.farmware_envs.destroy_all && "")
      else
        render json: (farmware_env.destroy! && "")
      end
    end

  private

    def farmware_env
      farmware_envs.find(params[:id])
    end

    def farmware_envs
      current_device.farmware_envs
    end
  end
end
