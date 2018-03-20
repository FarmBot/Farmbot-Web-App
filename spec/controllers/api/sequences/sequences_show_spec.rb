require 'spec_helper'

describe Api::SequencesController do
  before :each do
    request.headers["accept"] = 'application/json'
  end

  include Devise::Test::ControllerHelpers

  describe '#show' do

    let(:user) { FactoryBot.create(:user) }

    it 'shows sequence' do
      sign_in user
      id = FakeSequence.create( device: user.device).id
      get :show, params: { id: id }
      expect(response.status).to eq(200)
      expect(json[:id]).to eq(id)
    end
  end
end
