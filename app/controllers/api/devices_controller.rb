# Api::DevicesController is the RESTful endpoint for managing device related
# settings. Consumed by the Angular SPA on the front end.
module Api
  class DevicesController < Api::AbstractController

    # GET /api/device
    def show
      render json: current_device
    end

    # POST /api/device
    def create
      current_user.device = Device.new(device_params)
      if current_user.device.save
        render json: current_device
      end
    end

    # PATCH/PUT /api/device
    def update
      if current_device.update_attributes(device_params)
        render json: current_device
      end
    end

    # DELETE /api/devices/1
    def destroy
      if current_device.users.include?(current_user)
        current_device.destroy
        render nothing: true, status: 204
      end
    end

    private

      # Only allow a trusted parameter "white list" through.
      def device_params
        params.permit([:name, :uuid, :token])
      end
  end
end
