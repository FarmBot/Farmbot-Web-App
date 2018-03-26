require 'spec_helper'

describe Api::RegimensController do

  include Devise::Test::ControllerHelpers

  describe '#index' do
    let(:user) { FactoryBot.create(:user) }

    it 'retrieves all regimina' do
      sign_in user
      regimen = Regimen.create!(name: SecureRandom.hex, device: user.device)
      fe      = FactoryBot.create(:farm_event, executable: regimen)
      process :index, method: :get
      expect(response.status).to eq(200)
      expect(json.count).to eq(1)
      expect(json.first[:id]).to eq(regimen.id)
      expect(json.first[:in_use]).to eq(true)
    end

    it 'doesnt fetch other peoples regimens' do
      regimen = Regimen.create!(name: SecureRandom.hex, device: user.device)
      other_person = FactoryBot.create(:user)
      sign_in other_person
      process :index, method: :get
      expect(response.status).to eq(200)
      expect(json.count).to eq(0)
    end
  end
end
