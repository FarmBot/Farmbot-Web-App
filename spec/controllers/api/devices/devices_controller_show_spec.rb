require 'spec_helper'

describe Api::DevicesController do

  include Devise::Test::ControllerHelpers

  let(:user) { FactoryBot.create(:user) }

  describe '#show' do
    it 'handles deviceless requests' do
      user.update_attributes(device: nil)
      sign_in user
      get :show, params: {}, session: { format: :json }
      expect(response.status).to eq(422)
      expect(json[:error]).to include("You need to register a device first.")
    end

    it 'has expected keys' do
      sign_in user
      get :show, params: {}, session: { format: :json }
      { id:         Integer,
        name:       String }.each do |name, klass|
          expect(json[name]).to be_an_instance_of(klass)
        end
    end

    it 'reminds users to agree to TOS' do
      b4 = User::ENFORCE_TOS
      const_reassign(User, :ENFORCE_TOS, "http://farm.bot/tos")
      user.update_attributes!(agreed_to_terms_at: nil)
      sign_in user
      get :show, params: {}, session: { format: :json }
      const_reassign(User, :ENFORCE_TOS, b4)
      expect(response.status).to be(451)
    end
  end
end
