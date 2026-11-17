require "spec_helper"

RSpec.describe "FORCE_SSL protocol selection" do
  it "applies the selected WebSocket scheme to the default security policy" do
    configuration = SecureHeaders::Configuration.send(:default_config)
    schemes = configuration.csp.to_h.fetch(:connect_src)
      .select { |value| %w[ws: wss:].include?(value) }

    expect(schemes).to eq([FarmBot::Application.csp_websocket_scheme])
  end

  [
    { value: "TRUE", http: "https:", websocket: "wss:" },
    { value: " true ", http: "https:", websocket: "wss:" },
    { value: nil, http: "http:", websocket: "ws:" },
    { value: "", http: "http:", websocket: "ws:" },
    { value: "FALSE", http: "http:", websocket: "ws:" },
    { value: "1", http: "http:", websocket: "ws:" },
    { value: "on", http: "http:", websocket: "ws:" },
  ].each do |ssl|
    context "with FORCE_SSL=#{ssl[:value].inspect}" do
      around do |example|
        with_modified_env(FORCE_SSL: ssl[:value], MQTT_HOST: "broker.example.test") do
          example.run
        end
      end

      it "selects the RabbitMQ authentication callback protocol" do
        expect(RmqConfigWriter.ssl_protocol).to eq(ssl[:http])
      end

      it "selects the placeholder image protocol" do
        expect(Image.ssl_protocol).to eq(ssl[:http])
      end

      it "selects the account email URL protocol" do
        url = UserMailer.ssl_uri_class.build(host: "example.test")
        expect(url.to_s).to eq("#{ssl[:http]}//example.test")
      end

      it "selects the default MQTT WebSocket URL" do
        expect(SessionToken.default_mqtt_ws)
          .to eq("#{ssl[:websocket]}//broker.example.test:3002/ws")
      end

      it "selects the content security policy WebSocket scheme" do
        expect(FarmBot::Application.csp_websocket_scheme).to eq(ssl[:websocket])
      end
    end
  end
end
