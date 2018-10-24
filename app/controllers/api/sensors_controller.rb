module Api
  class SensorsController < Api::AbstractController
    def index
      render json: current_device.sensors
    end

    def show
      render json: sensor
    end

    def create
      mutate Sensors::Create.run(raw_json, device: current_device)
    end

    def update
      mutate Sensors::Update.run(raw_json, sensor: sensor, device: current_device)
    end

    def destroy
      mutate Sensors::Destroy.run(sensor: sensor)
    end

    private

    def sensor
      @sensor ||= current_device.sensors.find(params[:id])
    end
  end
end
