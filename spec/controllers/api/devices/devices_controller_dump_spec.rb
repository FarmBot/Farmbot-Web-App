require 'spec_helper'

describe Api::DevicesController do

  include Devise::Test::ControllerHelpers
  let(:user) { FactoryBot.create(:user) }
  EXPECTED = [:device,
              :images,
              :regimens,
              :peripherals,
              :farm_events,
              # :tools,
              # :points,
              :users,
              :webcam_feeds]

  describe '#dump' do
    it 'creates a backup of your account' do
      # NOTE: As of 11 December 17, the dump endpoint is only for dev purposes.
      #       Not going to spend a bunch of time  writing unit tests for this
      #       endpoint- just basic syntax checking.
      sign_in user
      get :dump, params: {}, session: { format: :json }
      expect(response.status).to eq(200)
      actual = json.keys
      EXPECTED.map { |key| expect(actual).to include(key) }
    end
  end
end
