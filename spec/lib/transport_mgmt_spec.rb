require "spec_helper"

describe Transport::Mgmt do
  it "generates a URL" do
    expect(Transport::Mgmt.api_url).to eq("http://blooper.io:15672")
  end

  it "finds connections by name" do
    fake_connections = [{ "name" => "A", "user" => "1" },
                        { "name" => "B", "user" => "2" },
                        { "name" => "C", "user" => "3" }]
                        allow(Transport::Mgmt).to receive(:connections).and_return(fake_connections)
                        expect(Transport::Mgmt.find_connection_by_name("1")).to eq(["A"])
  end
end
