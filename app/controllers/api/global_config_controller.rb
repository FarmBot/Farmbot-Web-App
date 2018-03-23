
module Api
  class GlobalConfigController < Api::AbstractController
    skip_before_action :authenticate_user!
    def show
      render json: GlobalConfig.dump
    end
  end
end

