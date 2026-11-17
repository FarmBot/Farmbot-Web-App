require "spec_helper"

describe Transport::Mgmt do

  it "generates credentials" do
    the_list = [:foo, :bar]
    dbl      = double("Fake API", list_connections: the_list)
    expect(Transport::Mgmt.username).to eq("admin")
    expect(Transport::Mgmt.password).to eq(ENV.fetch("ADMIN_PASSWORD"))
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

  describe "AMQP credentials" do
    around do |example|
      username = described_class.instance_variable_get(:@username)
      password = described_class.instance_variable_get(:@password)
      described_class.instance_variable_set(:@username, nil)
      described_class.instance_variable_set(:@password, nil)
      begin
        example.run
      ensure
        described_class.instance_variable_set(:@username, username)
        described_class.instance_variable_set(:@password, password)
      end
    end

    it "preserves literal plus signs in existing broker URLs" do
      url = "amqp://user+name:p+ass@mqtt:5672"
      allow(Transport).to receive(:amqp_url).and_return(url)

      expect(described_class.username).to eq("user+name")
      expect(described_class.password).to eq("p+ass")
    end

    it "decodes escaped plus signs and spaces" do
      url = "amqp://user%2Bname:p%2Bass%20word@mqtt:5672"
      allow(Transport).to receive(:amqp_url).and_return(url)

      expect(described_class.username).to eq("user+name")
      expect(described_class.password).to eq("p+ass word")
    end

    it "decodes percent-encoded punctuation once" do
      url = "amqp://user%40name:p%40ss%23w%2Frd%3F%252B@mqtt:5672"
      allow(Transport).to receive(:amqp_url).and_return(url)

      expect(described_class.username).to eq("user@name")
      expect(described_class.password).to eq("p@ss#w/rd?%2B")
    end
  end

  describe ".api_url" do
    before do
      allow(Transport).to receive(:amqp_url).and_return("amqp://admin:example@mqtt:5672")
    end

    it "uses HTTPS when FORCE_SSL is TRUE regardless of case or surrounding whitespace" do
      ["TRUE", "true", "TrUe", " TRUE "].each do |value|
        with_modified_env("FORCE_SSL" => value) do
          expect(described_class.api_url).to eq("https://mqtt:15672")
        end
      end
    end

    it "uses HTTP for other values, including blank and unset" do
      ["FALSE", "false", "0", "1", "yes", "on", "", "  ", nil].each do |value|
        with_modified_env("FORCE_SSL" => value) do
          expect(described_class.api_url).to eq("http://mqtt:15672")
        end
      end
    end
  end
end
