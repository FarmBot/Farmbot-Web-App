require "spec_helper"

describe Releases::Create do
  it "creates a release object (Google Cloud)" do
    Release.destroy_all
    url = "http://foo.bar/baz"
    expect(Release).to receive(:transload).with(any_args).and_return(url)
    ClimateControl.modify GCS_BUCKET: "whatever" do
      rel = Releases::Create.run!(image_url: url,
                                  version: "v7.6.5-rc4",
                                  platform: "rpi",
                                  channel: "beta")
      expect(rel.channel).to eq("beta")
      expect(rel.image_url).to eq("http://foo.bar/baz")
      expect(rel.platform).to eq("rpi")
      expect(rel.version).to eq("v7.6.5-rc4")
    end
  end

  it "creates a release object (Google Cloud)" do
    Release.destroy_all
    url = "http://foo.bar/baz"
    expect(Release).not_to receive(:transload).with(any_args) #.and_return(url)
    ClimateControl.modify GCS_BUCKET: nil do
      rel = Releases::Create.run!(image_url: url,
                                  version: "v7.6.5-rc4",
                                  platform: "rpi",
                                  channel: "beta")
      expect(rel.channel).to eq("beta")
      expect(rel.image_url).to eq("http://foo.bar/baz")
      expect(rel.platform).to eq("rpi")
      expect(rel.version).to eq("v7.6.5-rc4")
    end
  end
end
