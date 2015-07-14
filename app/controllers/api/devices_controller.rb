# Api::DevicesController is the RESTful endpoint for managing device related
# settings. Consumed by the Angular SPA on the front end.
module Api
  class DevicesController < Api::AbstractController

    # GET /api/device
    def show
      current_device
        .if_null { render json: {error: "add device to account"}, status: 404 }
        .if_not_null { render json: current_device }
    end

    # POST /api/device
    def create
      mutate Devices::Create.run(device_params, user: current_user)
    end

    # PATCH/PUT /api/device
    def update
      current_device
        .if_null { create }
        .if_not_null do
          render json: current_device.update_attributes(device_params)
        end
    end

    # DELETE /api/devices/1
    def destroy
      # TODO: Make a service that deletes old devices when they become 'orphans'
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
