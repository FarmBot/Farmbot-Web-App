module Api
  class TelemetriesController < Api::AbstractController
    before_action :trim_telemetry

    def create
      mutate Telemetries::Create.run(raw_json, device: current_device)
    end

    def index
      render json: current_device.limited_telemetry_list
    end

    def destroy
      if params[:id] == "all"
        render json: (current_device.telemetries.destroy_all && "")
      else
        render json: (current_device.telemetries.find(params[:id]).destroy! && "")
      end
    end

    private

    def trim_telemetry
      # WARNING: This is a slow method. Perform in background.
      current_device.delay.trim_excess_telemetry
    end
  end
end
