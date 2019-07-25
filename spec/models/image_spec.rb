require "spec_helper"

describe Image do
  let(:device) { FactoryBot.create(:device) }

  it "adds URL attachments", :slow do
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

    expect(url).to include("/system/images/attachments/000/000/123/x640/foo.jpg?")
    expect(url).to include(now.to_i.to_s)
  end
end
