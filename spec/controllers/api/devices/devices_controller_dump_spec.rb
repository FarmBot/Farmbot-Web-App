require 'spec_helper'

describe Api::DevicesController do
  include Devise::Test::ControllerHelpers
  let(:user) { FactoryBot.create(:user) }

  describe '#dump' do
    it 'queues the creation of an account backup' do
      sign_in user
      wow = double("WOW", run_by_id: nil)
      expect(wow).to receive(:run_by_id)
      expect(Devices::Dump).to receive(:delay).and_return(wow).once
      post :dump, params: {}, session: { format: :json }
      expect(response.status).to eq(200)
    end
  end
end
