require "spec_helper"

describe Image do
  let(:device) { FactoryBot.create(:device) }

  it "adds URL attachments", :slow do
    pending("WIP - replace this with ActiveStorage stuff")
    image = Image.create(device: device)
    expect(image.attachment_processed_at).to be_nil
    expect(image.attachment.exists?).to be_falsy

    image.set_attachment_by_url(FAKE_ATTACHMENT_URL)
    image.save!

    expect(image.attachment.exists?).to be_truthy
    expect(image.attachment_processed_at).to be_truthy
  end
end
