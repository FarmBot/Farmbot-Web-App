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
end
