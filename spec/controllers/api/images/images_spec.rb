require 'spec_helper'

describe Api::ImagesController do
  include Devise::Test::ControllerHelpers
  let(:user) { FactoryGirl.create(:user) }

  describe '#show' do
    it 'shows image meta data'
  end

  describe "#create" do
    it 'creates one image' do
      sign_in user
      before_count = Image.count
      post :create,
           body: { attachment_url: "http://i.imgur.com/OhLresv.png",
                   meta: { x: 1, y: 2, z: 3 } }.to_json,
           params: {format: :json}
      expect(response.status).to eq(200)
      expect(Image.count).to be > before_count
      expect(json[:device_id]).to eq(user.device.id)
      expect(json.key?(:attachment_processed_at)).to be_truthy
      expect(json[:attachment_url]).to include("placehold")
      expect(json.dig :meta, :x).to eq(1)
      expect(json.dig :meta, :y).to eq(2)
      expect(json.dig :meta, :z).to eq(3)
    end

    describe '#delete' do
      it 'deletes an image'
    end
  end
end
