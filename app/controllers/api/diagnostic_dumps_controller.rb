module Api
  class DiagnosticDumpsController < Api::AbstractController
    def index
      render json: diagnostic_dumps
    end

    def create
      mutate DiagnosticDumps::Create.run(raw_json, device: current_device)
    end

    def destroy
      diagnostic_dump.destroy!
      render json: ""
    end

    private

    def diagnostic_dumps
      current_device.diagnostic_dumps
    end

    def diagnostic_dump
      @diagnostic_dump ||= diagnostic_dumps.find(params[:id])
    end
  end
end
