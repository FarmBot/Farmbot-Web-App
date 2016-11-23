module Api
  class RegimensController < Api::AbstractController

    def index
      render json: your_regimens
    end

    def create
      mutate Regimens::Create.run(params.as_json, regimen_params)
    end

    def update
      mutate Regimens::Update.run(params.as_json,
                                  regimen_params,
                                  regimen: the_regimen)
    rescue => e
      binding.pry      
    end

    def destroy
      the_regimen.destroy!
      render json: ""
    end

  private

    def the_regimen
      your_regimens.find(params[:id])
    end

    def your_regimens
      Regimen.where(regimen_params)
    end
    
    def regimen_params
      { device: current_device }
    end
  end
end
