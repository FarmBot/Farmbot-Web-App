require "spec_helper"

describe Api::AisController do
  include Devise::Test::ControllerHelpers
  let(:user) { FactoryBot.create(:user) }
  let(:sequence) { FakeSequence.create(device: user.device) }

  def chunk(content, done=nil)
    "data: {\"id\":\"id\",\"object\":\"chat.completion.chunk\"," \
    "\"created\":12345,\"model\":\"gpt-4\",\"choices\":[{\"delta\":{" \
    "\"content\":\"#{content}\"},\"index\":0,\"finish_reason\":#{done.to_json}}]}\n\n"
  end

  URL_PATTERN = /raw\.githubusercontent\.com/

  it "makes a successful request for code" do
    sign_in user
    FactoryBot.create(:peripheral, device: user.device)
    FactoryBot.create(:sensor, device: user.device)
    FactoryBot.create(:tool, device: user.device)
    payload = {
      prompt: "write code",
      context_key: "lua",
      sequence_id: nil,
    }

    stub_request(:get, URL_PATTERN).to_return(
      body: "---\n---# section\ncontent```lua\n```")

    stub_request(:post, "https://api.openai.com/v1/chat/completions").to_return(
      body: chunk("return") + chunk("done", done="stop"))

    post :create, body: payload.to_json
    expect(response.status).to eq(200)
    expect(response.body).to eq("return")
  end

  it "makes a successful request for summary" do
    sign_in user
    payload = {
      prompt: "summarize",
      context_key: "color",
      sequence_id: sequence.id,
    }

    stub_request(:post, "https://api.openai.com/v1/chat/completions").to_return(
      body: chunk("red"))

    with_modified_env OPENAI_API_TEMPERATURE: "0.5" do
      post :create, body: payload.to_json
    end
    expect(response.status).to eq(200)
    expect(response.body).to eq("red")
  end

  it "handles errors" do
    sign_in user
    payload = {
      prompt: "write code",
      context_key: "lua",
      sequence_id: nil,
    }
    stub_request(:get, URL_PATTERN).to_return(
      body: "---\n---# section\ncontent```lua\n```")

    stub_request(:post, "https://api.openai.com/v1/chat/completions").to_timeout

    post :create, body: payload.to_json
    expect(response.status).to eq(422)
  end

  it "handles connection issues" do
    sign_in user
    payload = {
      prompt: "write code",
      context_key: "lua",
      sequence_id: nil,
    }

    stub_request(:get, URL_PATTERN).to_raise(SocketError)

    stub_request(:post, "https://api.openai.com/v1/chat/completions").to_timeout

    post :create, body: payload.to_json
    expect(response.status).to eq(422)
  end

  it "handles empty content" do
    sign_in user
    payload = {
      prompt: "write code",
      context_key: "lua",
      sequence_id: nil,
    }

    stub_request(:get, URL_PATTERN).to_return(
      body: "---\n---# nothing for now\n")

    stub_request(:post, "https://api.openai.com/v1/chat/completions").to_return(
      body: chunk("red"))

    post :create, body: payload.to_json
    expect(response.status).to eq(200)
    expect(response.body).to eq("red")
  end

  it "throttles requests" do
    sign_in user
    payload = {
      prompt: "",
      context_key: "title",
      sequence_id: sequence.id,
    }

    stub_request(:post, "https://api.openai.com/v1/chat/completions").to_return(
      body: chunk("title"))

    post :create, body: payload.to_json
    expect(response.status).to eq(200)
    expect(response.body).to eq("title")

    statuses = []
    bodies = []

    (0..30).map do |_|
      post :create, body: payload.to_json
      statuses.push(response.status)
      bodies.push(response.body)
    end

    if statuses.last() != 403 then puts statuses.join(" ") end
    expect(statuses).to include(403)
    expect(bodies).to include({error: "Too many requests. Try again later."}.to_json)
  end
end
