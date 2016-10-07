require 'spec_helper'

describe Api::SequencesController do

  include Devise::Test::ControllerHelpers

  describe '#create' do

    let(:user) { FactoryGirl.create(:user) }

    it 'creates a new sequences for a user' do
      sign_in user
      input = { name: "Scare Birds" }
      post :create, input
      expect(response.status).to eq(200)
    end

    it 'handles invalid params' do
      # Needed to test the `else` branch of mutate() somewhere
      sign_in user
      input = {}
      post :create, input
      expect(response.status).to eq(422)
      expect(json[:name]).to eq("Name is required")
    end
  end
end
