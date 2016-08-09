module Api
  class RegimensController < Api::AbstractController

    def index
      render json: Regimen.where(regimen_params)
    end

    def create
      ship_it = JSON.parse(params.to_json).merge(regimen_params)
      mutate Regimens::Create.run(ship_it)
    end

    def destroy
      raise "NOT IMPLENETED YET."
      # raise Errors::Forbidden, "Not your Regimen object."
    end
  private
    
    def regimen_params
      device: current_user.device
    end
  end
end
