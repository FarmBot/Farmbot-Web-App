class Api::DevicesController < ApplicationController
  before_action :ensure_logged_in

  def index
    @devices = Device.where(user_id: current_user.id)
    render json: @devices
  end

  # def create # Not yet implemented - sit tight. Coming soon!
  #   @device = Device.new(device_params)
  #   if @device.save
  #     render json: @device, status: 201
  #   else
  #     render json: @device, status: 400
  #   end
  # end

private

  # def device_params
  #   params.require(:person).permit(:name, :age)
  # end

  # Handles unauthorized / unauthenticated API requests.
  def ensure_logged_in
    unless current_user
      render nothing: true, :status => :unauthorized
    end
  end
end
