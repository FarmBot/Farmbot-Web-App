require "spec_helper"

describe "application content security policy" do
  it "allows the API host with and without its configured port" do
    api_host = ENV.fetch("API_HOST")
    api_port = ENV.fetch("API_PORT")
    sources = FarmBot::Application::ALL_LOCAL_URIS

    expect(sources).to include(api_host, "#{api_host}:#{api_port}")
  end
end
