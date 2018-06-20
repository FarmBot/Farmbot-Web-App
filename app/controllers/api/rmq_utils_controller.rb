module Api
  class RmqUtilsController < Api::AbstractController
    ALL = [:user, :vhost, :resource, :topic]
    skip_before_action :check_fbos_version, only: ALL
    skip_before_action :authenticate_user!, only: ALL

    def user
      # params["username"]
      # params["password"]
      # binding.pry
      render json: "allow"
    end

    def vhost
      # binding.pry
      render json: "allow"
    end

    def resource
      # binding.pry
      render json: "allow"
    end

    def topic
      # binding.pry
      render json: "allow"
    end
  end
end
