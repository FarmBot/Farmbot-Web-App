module Api
  class RegimensController < Api::AbstractController

    def index
      render json: your_regimens
    end

    def create
      ship_it = JSON.parse(params.to_json).merge(regimen_params)
      mutate Regimens::Create.run(ship_it)
    end

    def destroy
      the_regimen.destroy!
      render nothing: true
    end

  private

    def the_regimen
      your_regimens.find(params[:id])
    end

    def your_regimens
      Regimen.where(regimen_params)
    end
    
    def regimen_params
      { device: current_user.device }
    end
  end
end
