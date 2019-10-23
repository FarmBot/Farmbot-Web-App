require 'spec_helper'

describe WebcamFeed do
  let(:feed) { FactoryBot.create(:webcam_feed) }

  it "requires a URL" do
    result = feed.update(url: nil)
    expect(result).to be(false)
    expect(result).to be(false)
    expect(feed.errors.messages[:url]).to include("can't be blank")
  end
end
