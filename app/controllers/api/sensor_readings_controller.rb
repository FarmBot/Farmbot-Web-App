module Api
  class SensorReadingsController < Api::AbstractController
    LIMIT = 5000
    before_action :clean_old

    def create
      mutate SensorReadings::Create.run(raw_json, device: current_device)
    end

    def index
      maybe_paginate(readings)
    end

    def show
      render json: reading
    end

    def destroy
      reading.destroy!
      render json: ""
    end

    private

    def clean_old
      if current_device.sensor_readings.count > LIMIT
        current_device
          .sensor_readings
          .where
          .not(id: readings.pluck(:id))
          .delete_all
      end
    end

    def readings
      @readings ||= SensorReading
        .where(device: current_device)
        .order(created_at: :desc)
        .limit(LIMIT)
    end

    def reading
      @reading ||= readings.find(params[:id])
    end
  end
end
