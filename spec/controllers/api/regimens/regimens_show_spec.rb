require 'spec_helper'

describe Api::RegimensController do

  include Devise::Test::ControllerHelpers

  describe '#show' do
    let(:user) { FactoryBot.create(:user) }

    it 'retrieves a specific regimen' do
      sign_in user
      regimen = Regimen.create!(name: SecureRandom.hex, device: user.device)
      fe      = FactoryBot.create(:farm_event, executable: regimen)
      get :show, params: {id: regimen.id}
      expect(response.status).to eq(200)
      expect(json[:id]).to eq(regimen.id)
    end
  end
end
