require 'spec_helper'

describe Image do
    let(:device) { FactoryGirl.create(:device) }

    it 'adds URL attachments' do
      image = Image.new
      binding.pry
    end
end
