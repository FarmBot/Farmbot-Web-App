class Api::DevicesController < ApplicationController
  before_action :authenticate!

  def index
    @devices = Device.where(user_id: current_user.id)
    render json: @devices
  end

  def create
    @device = Device.new(device_params)
    if @device.save
      render json: @device, status: 201
    else
      render json: @device, status: 400
    end
  end

private

  def device_params
    params.require(:person).permit(:name, :age)
  end

  def authenticate!
    unless current_user
      render nothing: true, :status => :unauthorized
    end
  end
end
