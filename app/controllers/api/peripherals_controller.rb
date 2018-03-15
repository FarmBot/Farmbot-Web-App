module Api
  class PeripheralsController < Api::AbstractController
    def index
      render json: current_device.peripherals
    end

    def create
      mutate Peripherals::Create.run(raw_json, device: current_device)
    end

    def update
      mutate Peripherals::Update.run(raw_json,
                                     peripheral: peripheral,
                                     device: current_device)
    end

    def destroy
      mutate Peripherals::Destroy.run(peripheral: peripheral)
    end

    private

    def peripheral
      @peripheral ||= current_device.peripherals.find(params[:id])
    end
  end
end
