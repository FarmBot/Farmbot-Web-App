module Api
  class SensorReadingsController < Api::AbstractController
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
      current_device.delay.trim_excess_sensor_readings
    end

    def readings
      @readings ||= SensorReading
        .where(device: current_device)
        .order(created_at: :desc)
        .limit(Device::DEFAULT_MAX_SENSOR_READINGS)
    end

    def reading
      @reading ||= readings.find(params[:id])
    end
  end
end
