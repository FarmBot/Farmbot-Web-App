require 'spec_helper'

describe Api::SequencesController do

  include Devise::Test::ControllerHelpers

  describe '#show' do

    let(:user) { FactoryGirl.create(:user) }

    it 'shows sequence' do
      sign_in user
      id = FactoryGirl.create(:sequence, device: user.device).id
      get :show, params: { id: id }
      expect(response.status).to eq(200)
      expect(json[:id]).to eq(id)
    end
  end
end
