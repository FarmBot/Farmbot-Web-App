module Api
  class SensorReadingsController < Api::AbstractController
    def create
        mutate SensorReadings::Create.run(raw_json, device: current_device)
    end

    def index
      render json: readings
    end

    def show
      render json: reading
    end

    def destroy
      reading.destroy!
      render json: ""
    end

  private

    def readings
      SensorReading.where(device: current_device)
    end

    def reading
      @image ||= readings.find(params[:id])
    end
  end
end
