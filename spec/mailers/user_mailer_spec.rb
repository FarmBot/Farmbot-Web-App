require "spec_helper"

describe UserMailer, type: :mailer do
  let(:device) { FactoryBot.create(:device) }
  it "generates appropriate URLs" do
    no_port = UserMailer.url_object("altavista.com", nil)
    ssl     = UserMailer.url_object("altavista.com", "443")
    basic   = UserMailer.url_object("altavista.com", "80")
    default = UserMailer.url_object("altavista.com", "3000")
    expect(no_port.to_s).to eq("http://altavista.com")
    expect(ssl.to_s).to     eq("http://altavista.com")
    expect(basic.to_s).to   eq("http://altavista.com")
    expect(default.to_s).to eq("http://altavista.com:3000")
  end
end
