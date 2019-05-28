module Resources
  MQTT_CHAN         = "from_api"
  CHANNEL_TPL       =
    "bot.device_%{device_id}.resources_v0.%{action}.%{klass}.%{uuid}.%{id}"
  INDEX_OF_USERNAME = 1
  INDEX_OF_OP       = 3
  INDEX_OF_KIND     = 4
  INDEX_OF_UUID     = 5
  INDEX_OF_ID       = 6

  class Service

    def self.ok(uuid)
      { kind: "rpc_ok", args: { label: uuid } }.to_json
    end

    def self.rpc_err(uuid, error)
      {
        kind: "rpc_error",
        args: { label: uuid },
        body: (error
        .errors
        .values
        .map { |err| { kind: "explanation", args: { message: err.message }} })
      }.to_json
    end

    def self.step1(delivery_info, body) # Returns params or nil
      pp "====== Resource usage?"
      pp delivery_info
      pp body
      pp "======"
      Preprocessor.from_amqp(delivery_info, body)
    rescue Mutations::ValidationException => q
      Rollbar.error(q)
      raw_chan = delivery_info&.routing_key&.split(".") || []
      id       = raw_chan[INDEX_OF_USERNAME]&.gsub("device_", "")&.to_i
      uuid     = raw_chan[INDEX_OF_UUID] || "NONE"
      Transport.current.amqp_send(rpc_err(uuid, q), id, MQTT_CHAN) if id
      nil
    end

    def self.step2(params)
      dev    = params[:device]

      dev.auto_sync_transaction do
        Job.run!(params)
        uuid   = (params[:uuid] || "NONE")
        Transport.current.amqp_send(ok(uuid), dev.id, MQTT_CHAN)
      end
    rescue Mutations::ValidationException => q
      device = params.fetch(:device)
      Rollbar.info("device_#{device.id} using AMQP resource mgmt")
      uuid   = params.fetch(:uuid)
      errors = q.errors.values.map do |err|
        { kind: "explanation", args: { message: err.message }}
      end
      message = { kind: "rpc_error",
                  args: { label: uuid },
                  body: errors }.to_json
      Transport.current.amqp_send(message, device.id, MQTT_CHAN)
    end

    def self.process(delivery_info, body)
      params = step1(delivery_info, body)
      params && step2(params)
    end
  end # Service
end # Resources
