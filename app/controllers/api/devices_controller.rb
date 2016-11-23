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
      mutate Devices::Create.run(params.as_json, user: current_user)
    end

    # PATCH/PUT /api/device
    def update
      mutate Devices::Update.run(params.as_json, device: current_device)
    end

    # DELETE /api/devices/1
    def destroy
      Devices::Destroy.run!(user: current_user, device: current_device)
      render nothing: true, status: 204
    end

    private

      # Only allow a trusted parameter "white list" through.
      def device_params
        { name:  params[:name] }
      end
  end
end
