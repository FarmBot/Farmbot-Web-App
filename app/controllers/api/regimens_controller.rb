module Api
  class RegimensController < Api::AbstractController

    def index
      raise "NOT IMPLENETED YET."
      # render json: Regimen.where(regimen_params)
    end

    def create
      ship_it = JSON.parse(params.to_json).merge(device: current_user.device)
      mutate Regimens::Create.run(ship_it)
    end

    def destroy
      raise "NOT IMPLENETED YET."
      # raise Errors::Forbidden, "Not your Regimen object."
    end
  end
end
