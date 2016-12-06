module Api
  class LogsController < Api::AbstractController
    def create
      # binding.pry
    end

    def index
      render json: current_device.logs.last(25)
    end
  end
end
