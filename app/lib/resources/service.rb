module Resources
  class Service
    def self.process(delivery_info, body)
      params = PreProcessor.from_amqp(delivery_info, body)
      Job.run!(params)
      puts "Transport.amqp_send(message, id, channel)"
    rescue Mutations::ValidationException => q
      params ||= {}
      device_id = params[:device].try(:id)
      if device_id
        message = {
          kind: "rpc_error",
          args: { label: params.fetch(:uuid) { "NONE" } },
          body: (q
          .errors
          .values
          .map { |err| { kind: "explanation", args: { message: err.message }} })
        }.to_json
        Transport.amqp_send(message, device_id, "from_api")
      end
    end
  end # Service
end # Resources
