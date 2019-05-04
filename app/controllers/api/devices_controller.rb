# Api::DevicesController is the RESTful endpoint for managing device related
# settings. Consumed by the Angular SPA on the front end.
module Api
  class DevicesController < Api::AbstractController
    cattr_accessor :send_emails
    self.send_emails = !ENV["NO_EMAILS"]

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
      send_emails ? email_data_dump : store_data_dump
    end

    def sync
      mutate Devices::Sync.run(device: current_device)
    end

    def seed
      mutate Devices::CreateSeedData.run params.as_json, device: current_device
    end

    def reset
      mutate Devices::Reset.run(params.as_json, device: current_device)
    end

    private

    # Store the JSON on the local filesystem for self hosted users that don't
    # have email set up.
    #
    # Q: Why not just return JSON all the time instead of emailing?
    #
    # A: Querying and serializing every single resource a device has is
    #    expensive. Slow requests will bog down requests for all users.
    #    If the server has email enabled, it's better to do the work in a
    #    background process.
    def store_data_dump
      mutate Devices::Dump.run(device: current_device)
    end

    def email_data_dump
      DataDumpMailer.email_json_dump(current_device).deliver_later
      render json: nil, status: 202 # "Accepted"
    end
  end
end
