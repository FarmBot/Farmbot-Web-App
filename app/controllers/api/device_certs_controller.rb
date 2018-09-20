module Api
  class DeviceCertsController < Api::AbstractController
    def create
      # TODO(Connor) - This is just a stub.
      serial = params["serial_number"] || raise("no serial supplied")
      tags = params["tags"] || raise("no tags supplied")
      NervesHub.new_device(serial, tags)
      certs = NervesHub.sign_device(serial)
      data = certs
      data[:nerves_hub_host] = NervesHub.hostname()
      data[:nerves_hub_port] = NervesHub.port()
      data[:nerves_hub_ca]   = NervesHub.ca()
      render json: data
    end

private

  end
end
