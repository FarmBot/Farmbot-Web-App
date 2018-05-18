require 'spec_helper'

describe Image do
    let(:device) { FactoryBot.create(:device) }

    it 'adds URL attachments', :slow do
      image = Image.create(device: device)
      expect(image.attachment_processed_at).to be_nil
      expect(image.attachment.exists?).to be_falsy

      image.set_attachment_by_url("https://placeholdit.imgix.net/~text?txts"\
                                  "ize=5&txt=1%C3%971&w=1&h=1&txtpad=1")
      image.save!

      expect(image.attachment.exists?).to be_truthy
      expect(image.attachment_processed_at).to be_truthy
    end
end
