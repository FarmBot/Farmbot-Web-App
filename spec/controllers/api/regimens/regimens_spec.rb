require 'spec_helper'

describe Api::RegimensController do

  include Devise::Test::ControllerHelpers

  describe '#index' do
    let(:user) { FactoryGirl.create(:user) }

    it 'retrieves all regimina' do
      regimen = Regimen.create!(name: SecureRandom.hex, device: user.device)
      sign_in user
      process :index, method: :get
      expect(response.status).to eq(200)
      expect(json.count).to eq(1)
      expect(json.first[:id]).to eq(regimen.id)
    end

    it 'doesnt fetch other peoples regimens' do
      regimen = Regimen.create!(name: SecureRandom.hex, device: user.device)
      other_person = FactoryGirl.create(:user)
      sign_in other_person
      process :index, method: :get
      expect(response.status).to eq(200)
      expect(json.count).to eq(0)
    end
  end
end
