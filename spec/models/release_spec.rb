require "spec_helper"
describe Release do
  it "finds the latest version for a set of params" do
    Release.destroy_all
    [
      ["stable", "rpi", "v11.0.1"],
      ["stable", "rpi3", "v11.0.1"],
      ["beta", "rpi", "v11.0.1"],
      ["beta", "rpi3", "v11.0.1"],
      ["stable", "rpi", "v11.1.0"],
      ["stable", "rpi3", "v11.1.0"],
      ["beta", "rpi", "v11.1.0"],
      ["beta", "rpi3", "v11.1.0"],
    ].map do |(chan, plat, ver)|
      Release.create!(image_url: "http://farm.bot/fw.fw",
                      version: ver,
                      platform: plat,
                      channel: chan)
    end
    query = { channel: "stable", platform: "rpi" }
    rel = Release.maybe_find_latest(query)
    expect(rel.channel).to eq("stable")
    expect(rel.platform).to eq("rpi")
    expect(rel.version).to eq("v11.1.0")
    expect(rel.version).to eq("v11.1.0")
  end

  # Not a fan of this test due to the high number of stubs
  # and doubles. This is a mostly internal method, so I will
  # leave it as is for now..
  it "downloads one URL and uploads to another" do
    starting_url = "http://farm.bot/fbos.fw"
    fake_file = "fake_fw_file"
    fake_local_path = "/farmbot/tmp/fbos.fw"
    fake_bucket = "fake-bucket-name"
    fake_final_url = "http://gcs/new_location.fw"

    expect(URI).to receive(:open).with(starting_url).and_return(fake_file)
    expect(IO).to receive(:copy_stream).with(fake_file, fake_local_path)
    gcs_file = double("fake GCS File obj", url: fake_final_url)
    bucket = double(Google::Cloud::Storage::Bucket, upload_file: gcs_file)
    gcs = double(Google::Cloud::Storage, bucket: bucket)
    ClimateControl.modify GCS_BUCKET: fake_bucket do
      result = Release.transload(starting_url, gcs)
      expect(result).to eq(fake_final_url)
    end
  end
end
