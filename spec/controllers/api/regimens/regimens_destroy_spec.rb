require "spec_helper"

describe Api::RegimensController do

  include Devise::Test::ControllerHelpers

  describe '#index' do
    let(:user) { FactoryBot.create(:user) }
    let!(:regimen) { FactoryBot.create(:regimen, device: user.device) }

    it 'prevents deletion of resources that are in use' do
      sign_in user
      farm_event = FactoryBot.create(:farm_event,
                                      executable: regimen,
                                      start_time: Time.now.tomorrow)
      before     = Regimen.count
      delete :destroy, params: { id: regimen.id }
      after      = FarmEvent.count
      expect(response.status).to eq(422)
      expect(json[:regimen]).to include("still in use")
      expect(Regimen.exists?(regimen.id)).to eq(true)
    end

    it 'deletes a regimen' do
      sign_in user
      old_count = Regimen.count
      device    = regimen.device
      s         = FakeSequence.create( device: device)
      RegimenItem.create!(time_offset: 1, regimen: regimen, sequence: s)
      delete :destroy, params: { id: regimen.id }
      new_count = Regimen.count
      expect(response.status).to eq(200)
      expect(old_count).to be > new_count
      expect { regimen.reload }.to(raise_error(ActiveRecord::RecordNotFound))
    end
  end
end
