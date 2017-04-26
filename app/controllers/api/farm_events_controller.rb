module Api
  class FarmEventsController < Api::AbstractController
    before_action :clean_expired_farm_events, only: [:index]

    def index
      render json: current_device.farm_events
    end

    def create
      mutate FarmEvents::Create.run(params.as_json, device: current_device)
    end

    def update
      mutate FarmEvents::Update.run(params.as_json,
                                    device:     current_device,
                                    farm_event: farm_event)
    end

    def destroy
      if (farm_event.device_id == current_device.id) && farm_event.destroy
        render json: ""
      else
        raise Errors::Forbidden, 'Not your farm_event.'
      end
    end

    private

    def farm_event
      @farm_event ||= FarmEvent.find(params[:id])
    end

    def default_serializer_options
      # For some strange reason, angular-data crashes if we don't call super()
      # here. Rails doesn't care, though.
      super.merge(start: params[:start], finish: params[:finish])
    end
  end
end
