class Api::DevicesController < ApplicationController
  respond_to :json
  before_action :authenticate_user!
  before_action :set_device, only: [:show, :edit, :update, :destroy]

  # GET /api/devices
  def index
    @devices = Device.where(user_id: current_user.id)
    render json: @devices
  end

  # GET /api/devices/1
  def show
  end

  # POST /api/devices
  def create
    @device      = Device.new(device_params)
    @device.user = current_user
    if @device.save
      render json: @device
    end
  end

  # PATCH/PUT /api/devices/1
  def update
    if @device.update(device_params)
      render json: @device
    end
  end

  # DELETE /api/devices/1
  def destroy
    if @device.user == current_user
      @device.destroy
      render nothing: true, status: 204
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_device
      @device = Device.find(params[:id])
    end

    # Only allow a trusted parameter "white list" through.
    def device_params
      params.permit([:name, :uuid, :token])
    end
end
