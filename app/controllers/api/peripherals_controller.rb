module Api
  class PeripheralsController < Api::AbstractController
    def index
    end

    def create
      mutate Peripherals::Create.run(params,
                                   peripheral: peripheral,
                                   device: current_device)
    end

    def update
      if peripheral.device != current_device
        raise Errors::Forbidden, 'Not your Peripheral.'
      end
      mutate Peripherals::Update.run(params,
                                   peripheral: peripheral,
                                   device: current_device)
    end

    def destroy
      if (peripheral.device_id == current_device.id) && peripheral.destroy!
        render nothing: true
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
