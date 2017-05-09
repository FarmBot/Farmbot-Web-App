
module Api
  class ToolBaysController < Api::AbstractController
    skip_before_action :authenticate_user!, only: [:index]

    def index
      puts "TODO: REMOVE THIS CONTROLLER IN JUNE 2017"
      render json: []
    end
  end
end
