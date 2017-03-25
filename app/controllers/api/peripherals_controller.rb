module Api
  class PeripheralsController < Api::AbstractController
    def index
      render json: current_device.peripherals
    end

    # This controller action is barely RESTful.
    # Replaces *all* existing peripherals with a new array of peripherals.
    def create
      mutate Peripherals::Create.run(params.as_json, device: current_device)
    end

    def update
      mutate Peripherals::Update.run(params.as_json, device: current_device)
    end

    def destroy
      if (peripheral.device_id == current_device.id) && peripheral.destroy!
        render json: ""
      else
        raise Errors::Forbidden, 'Not your Peripheral.'
      end
    end

    private

    def peripheral
      @peripheral ||= Peripheral.find(params[:id])
    end
  end
end
