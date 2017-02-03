module Api
  class FarmEventsController < Api::AbstractController
    def index
      render json: current_device.farm_events
    end

    def create
      mutate FarmEvents::Create.run(params.as_json,
                                   device:     current_device,
                                   executable: executable)
    end

    def update
      if farm_event.device != current_device
        raise Errors::Forbidden, 'Not your farm_event.'
      end
      mutate FarmEvents::Update.run(params[:farm_event].as_json,
                                   executable: executable,
                                   device: current_device,
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

    def executable
      if (@executable)
        @executable
      else
        klass = ({
          "Sequence": Sequence,
          "Regimen": Regimen
        })[params[:executable_type]]
        raise "NO!" unless klass
        @executable ||= klass.where(id: params[:executable_id]).first
      end
    end

    def farm_event
      @farm_event ||= FarmEvent.find(params[:id])
    end

    def default_serializer_options
      # For some strange reason, angular-data crashes if we don't call super()
      # here. Rails doesn't care, though.
      super.merge(start: params[:start],
                  finish: params[:finish])
    end
  end
end
