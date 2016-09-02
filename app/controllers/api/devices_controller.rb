# Api::DevicesController is the RESTful endpoint for managing device related
# settings. Consumed by the Angular SPA on the front end.
module Api
  class DevicesController < Api::AbstractController

    # GET /api/device
    def show
      current_device
        .if_null { create }
        .if_not_null { render json: current_device }
    end

    # POST /api/device
    def create
      mutate Devices::Create.run(device_params, user: current_user)
    end

    # PATCH/PUT /api/device
    def update
      # Because of the way bots are shared, there is no true 'update' action.
      # Just a creation/reasignment of bots based on UUID / Token.
      create
    end

    # DELETE /api/devices/1
    def destroy
      Devices::Destroy.run!(user: current_user, device: current_device)
      render nothing: true, status: 204
    end

    private

      # Only allow a trusted parameter "white list" through.
      def device_params
        { name:  params[:name]  || Haikunator.haikunate(99),
          uuid:  params[:uuid]  || SecureRandom.uuid,
          token: params[:token] || SecureRandom.hex }
      end
  end
end
