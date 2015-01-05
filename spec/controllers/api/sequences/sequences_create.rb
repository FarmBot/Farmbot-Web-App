require 'spec_helper'

describe Api::SequencesController do

  include Devise::TestHelpers

  describe '#create' do

    let(:user) { FactoryGirl.create(:user) }

    it 'creates a new sequences for a user' do
      sign_in user
      post :create, {}
      expect(response.status).to eq(200)
    end
  end
end
