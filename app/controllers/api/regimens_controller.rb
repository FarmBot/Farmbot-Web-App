module Api
  class RegimensController < Api::AbstractController
    before_action :clean_expired_farm_events, only: [:destroy]

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
    end

    def destroy
      mutate Regimens::Destroy.run(regimen: the_regimen, device: current_device)
    end

  private

    def the_regimen
      your_regimens.find(params[:id])
    end

    def your_regimens
      Regimen.includes(:farm_events).where(regimen_params)
    end

    def regimen_params
      { device: current_device }
    end
  end
end
