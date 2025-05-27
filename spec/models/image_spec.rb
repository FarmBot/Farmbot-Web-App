require "spec_helper"

describe Image do
  let(:device) { FactoryBot.create(:device) }
  image_data = File.read(Rails.root.join("public", "plant.jpg"))

  it "adds URL attachments", :slow do
    stub_request(:get, FAKE_ATTACHMENT_URL).to_return(
      status: 200,
      body: image_data,
      headers: {
        "Content-Type" => "image/jpeg",
        "Content-Length" => image_data.size.to_s
      }
    )
    image = Image.create(device: device)
    expect(image.attachment_processed_at).to be_nil
    expect(image.attachment.attached?).to be false

    image.set_attachment_by_url(FAKE_ATTACHMENT_URL)
    image.save!
    expect(image.attachment.attached?).to be true
    expect(image.attachment_processed_at).to be_truthy
  end

  it "generates legacy URLs for images generated via (deprecated) PaperClip" do
    now = Time.now
    i = Image.new
    i.id = 123
    i.attachment_file_name = "foo.jpg"
    i.attachment_updated_at = now
    url = i.legacy_url("x640")
    expect(url).to include("/images/attachments/000/000/123/x640/foo.jpg?")
    expect(url).to include(now.to_i.to_s)
  end

  it "generates a URL when BUCKET is set" do
    with_modified_env(GCS_BUCKET: "foo") do
      i = Image.new
      expect(i).to receive(:attachment).and_return(Struct.new(:key).new("bar"))
      url = i.regular_url
      expect(url).to eq("https://storage.googleapis.com/foo/bar")
    end
  end
end
