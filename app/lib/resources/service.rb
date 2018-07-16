module Resources
  class Service
    def self.process(delivery_info, body)
      params = PreProcessor.from_amqp(delivery_info, body)
      puts "TODO: Transport.amqp_send(message, id, channel)"
      Job.run!(params)
    rescue Mutations::ValidationException => q
      params ||= {}
      device_id = params.fetch(:device) do
        delivery_info
          &.routing_key
          &.split(".")
          .try(:[], 1)
          &.gsub("device_", "")
          &.to_i
      end
      if device_id
        message = {
          kind: "rpc_error",
          args: { label: params.fetch(:uuid) { "NONE" } },
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
