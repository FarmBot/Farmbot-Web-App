require "spec_helper"
describe Release do
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
      expect(result).to eq((fake_final_url))
    end
  end
end
