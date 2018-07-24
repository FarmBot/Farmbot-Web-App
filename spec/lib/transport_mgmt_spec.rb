require "spec_helper"

describe Transport::Mgmt do

  it "generates credentials" do
    pending("RE-ENABLE AFTER NEXT RELEASE")
    the_list = [:foo, :bar]
    dbl      = double("Fake API", list_connections: the_list)
    expect(["admin", "guest"]).to include(Transport::Mgmt.username)
    expect(Transport::Mgmt.password).to eq(ENV["ADMIN_PASSWORD"] || "guest" )
    expect(Transport::Mgmt.client).to be_kind_of(RabbitMQ::HTTP::Client)
    expect(Transport::Mgmt.client.endpoint).to eq(Transport::Mgmt.api_url)
    Transport::Mgmt.instance_variable_set(:@client, dbl)
    expect(Transport::Mgmt.connections).to eq(the_list)
  end

  it "finds connections by name" do
    fake_connections = [{ "name" => "A", "user" => "1" },
                        { "name" => "B", "user" => "2" },
                        { "name" => "C", "user" => "3" }]
                        allow(Transport::Mgmt).to receive(:connections).and_return(fake_connections)
                        expect(Transport::Mgmt.find_connection_by_name("1")).to eq(["A"])
  end
end
