require 'spec_helper'

describe Api::SequencesController do

  include Devise::Test::ControllerHelpers

  describe '#index' do

    let(:user) { FactoryGirl.create(:user) }

    it 'lists all sequences for a user' do
      sign_in user
      sequences = FactoryGirl
                    .create_list(:sequence, 2, device: user.device)
                    .map(&:id)
                    .sort
      get :index
      expect(response.status).to eq(200)
      expect(json.length).to eq(2)
      expect(json.map{ |s| s[:id] }.sort).to eq(sequences)
    end
  end
end
