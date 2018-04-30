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
      render json: "", status: 204
    end

    def dump
      DataDumpMailer.email_json_dump(current_device).deliver_later
      render json: ""
    end
  end
end
