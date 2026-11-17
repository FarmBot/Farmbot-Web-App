require "spec_helper"

describe Transport do
  class TransportTest < Transport
    attr_reader :collector

    def initialize
      @collector = []
    end

    def raw_amqp_send(message, routing_key)
      collector.push(message: message,
                     routing_key: routing_key)
    end
  end

  it "sends demo credentials to non-registered users" do
    user = FactoryBot.create(:user)
    secret = SecureRandom.alphanumeric
    t = TransportTest.new
    t.send_demo_token_to(user, secret)
    call = t.collector.first
    token = JSON.parse(call.fetch(:message), symbolize_names: true)
    actual_secret = call.fetch(:routing_key).split(".").last
    expect(actual_secret).to eq(secret)
    user_id = token.dig(:token, :unencoded, :sub)
    expect(user_id).to eq(user.id)
  end

  describe ".amqp_url" do
    def fresh_amqp_url
      Transport.instance_variable_set(:@amqp_url, nil)
      Transport.amqp_url
    ensure
      Transport.instance_variable_set(:@amqp_url, nil)
    end

    it "ignores blank URL variables" do
      env = { Transport::CLOUDAMQP_ENV_KEY => "",
              "RABBITMQ_URL" => "",
              "ADMIN_PASSWORD" => "simple123" }
      with_modified_env(env) do
        expect(fresh_amqp_url).to eq("amqp://admin:simple123@mqtt:5672")
      end
    end

    it "uses RABBITMQ_URL when it is set" do
      env = { Transport::CLOUDAMQP_ENV_KEY => nil,
              "RABBITMQ_URL" => "amqp://u:p@broker:5672" }
      with_modified_env(env) do
        expect(fresh_amqp_url).to eq("amqp://u:p@broker:5672")
      end
    end
  end

  it "escapes special characters in ADMIN_PASSWORD" do
    password = "p@ss#w/rd?%{x} y"
    uri = URI(Transport.default_amqp_url(password)) # Raises if not escaped.
    expect(uri.host).to eq("mqtt")
    expect(uri.port).to eq(5672)
    expect(uri.user).to eq("admin")
    expect(Transport::Mgmt.decode(uri.password)).to eq(password)
  end
end
