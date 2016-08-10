require 'spec_helper'

describe Api::RegimensController do

  include Devise::Test::ControllerHelpers

  describe '#index' do
    let(:user) { FactoryGirl.create(:user) }
    let!(:regimen) { FactoryGirl.create(:regimen, device: user.device) }

    it 'retrieves all regimina' do
      sign_in user
      get :index
      expect(response.status).to eq(200)
      expect(json.count).to eq(1)
      expect(json.first[:_id]).to eq(regimen._id.to_s)
    end

    it 'doesnt fetch other peoples regimens' do
      other_person = FactoryGirl.create(:user)
      sign_in other_person
      get :index
      expect(response.status).to eq(200)
      expect(json.count).to eq(0)
    end
  end
end
