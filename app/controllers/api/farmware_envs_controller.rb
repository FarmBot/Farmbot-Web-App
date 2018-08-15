# Api::FarmwareEnvController is the RESTful endpoint for managing key/value
# configuration pairs.
module Api
  # Device configs controller handles CRUD for user definable key/value pairs.
  # Usually used by 3rd party Farmware devs. Not used often as of May 2018
  class FarmwareEnvsController < Api::AbstractController

    def create
      mutate FarmwareEnvs::Create.run(params.as_json, device: current_device)
    end

    def index
      render json: farmware_envs
    end

    def update
      mutate FarmwareEnvs::Update.run(raw_json, farmware_env: farmware_env)
    end

    def destroy
      render json: (farmware_env.destroy! && "")
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
