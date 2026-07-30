require "spec_helper"

describe Rack::Attack do
  around do |example|
    original_store = Rack::Attack.cache.store
    Rack::Attack.cache.store = ActiveSupport::Cache::MemoryStore.new
    example.run
  ensure
    Rack::Attack.cache.store = original_store
  end

  it "throttles password reset requests by IP" do
    app = ->(_env) { [200, {}, ["OK"]] }
    request = Rack::MockRequest.new(Rack::Attack.new(app))
    options = { "REMOTE_ADDR" => "192.0.2.1" }

    Rack::Attack::PASSWORD_RESET_IP_LIMIT.times do
      expect(request.post("/api/password_resets", options).status).to eq(200)
    end

    response = request.post("/api/password_resets", options)

    expect(response.status).to eq(429)
    expect(response.body).to eq(Rack::Attack::THROTTLE_WARNING)
  end

  it "throttles password resets by normalized email across IP addresses" do
    app = ->(_env) { [200, {}, ["OK"]] }
    request = Rack::MockRequest.new(Rack::Attack.new(app))
    emails = [
      "target@example.com",
      "TARGET@example.com",
      " target@example.com ",
      "Target@Example.com",
    ]
    responses = emails.each_with_index.map do |email, index|
      request.post(
        "/api/password_resets",
        "CONTENT_TYPE" => "application/json",
        "REMOTE_ADDR" => "192.0.2.#{index + 1}",
        input: { email: email }.to_json,
      )
    end

    expect(responses.first(3).map(&:status)).to eq([200, 200, 200])
    expect(responses.last.status).to eq(429)
    expect(responses.last.body).to eq(Rack::Attack::THROTTLE_WARNING)
  end

  it "rejects oversized bodies and counts them against the IP limit" do
    app = ->(_env) { [200, {}, ["OK"]] }
    request = Rack::MockRequest.new(Rack::Attack.new(app))
    body = {
      email: "target@example.com",
      padding: "x" * Rack::Attack::PASSWORD_RESET_BODY_LIMIT,
    }.to_json

    options = {
      "CONTENT_TYPE" => "application/json",
      "REMOTE_ADDR" => "192.0.2.1",
      input: body,
    }
    responses = (Rack::Attack::PASSWORD_RESET_IP_LIMIT + 1).times.map do
      request.post("/api/password_resets", options)
    end

    allowed = responses.first(Rack::Attack::PASSWORD_RESET_IP_LIMIT)
    expect(allowed.map(&:status).uniq).to eq([413])
    expect(responses.first.body).to eq("Payload Too Large\n")
    expect(responses.last.status).to eq(429)
    expect(responses.last.body).to eq(Rack::Attack::THROTTLE_WARNING)
  end
end
