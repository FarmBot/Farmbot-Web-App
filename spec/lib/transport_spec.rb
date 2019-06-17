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

  it "sends guest credentials to guest user" do
    user = FactoryBot.create(:user)
    secret = SecureRandom.alphanumeric
    t = TransportTest.new
    t.send_guest_token_to(user, secret)
    call = t.collector.first
    token = JSON.parse(call.fetch(:message), symbolize_names: true)
    actual_secret = call.fetch(:routing_key).split(".").last
    expect(actual_secret).to eq(secret)
    user_id = token.dig(:token, :unencoded, :sub)
    expect(user_id).to eq(user.id)
  end
end
