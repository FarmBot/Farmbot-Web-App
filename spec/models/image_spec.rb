require 'spec_helper'

describe Image do
    let(:device) { FactoryGirl.create(:device) }

    it 'adds URL attachments' do
      image = Image.create(device: device)
      expect(image.attachment_processed_at).to be_nil
      expect(image.attachment.exists?).to be_falsy

      image.set_attachment_by_url("http://i.imgur.com/OhLresv.png")
      image.save!

      expect(image.attachment.exists?).to be_truthy
      expect(image.attachment_processed_at).to be_truthy
    end
end
