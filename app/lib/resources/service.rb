module Resources
  class Service
    def self.process(delivery_info, body)
      params = PreProcessor.from_amqp(delivery_info, body)
      puts params
      result = Job.run!(params)
      payl   = result ? result.to_json : ""
      Transport
        .current
        .amqp_send(payl, params[:device].id, "from_api")
    rescue Mutations::ValidationException => q
      Rollbar.error(q)
      params  ||= {}
      raw_chan  = delivery_info&.routing_key&.split(".") || []
      device_id =
        params.fetch(:device) { raw_chan[1]&.gsub("device_", "")&.to_i }
      if device_id
        message = {
          kind: "rpc_error",
          args: { label: params[:uuid] || raw_chan[6] || "NONE" },
          body: (q
          .errors
          .values
          .map { |err| { kind: "explanation", args: { message: err.message }} })
        }.to_json
        Transport.current.amqp_send(message, device_id, "from_api")
      end
    end
  end # Service
end # Resources
