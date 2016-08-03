require 'spec_helper'

describe Api::SequencesController do

  include Devise::Test::ControllerHelpers

  describe '#destroy' do


    let(:user) { FactoryGirl.create(:user) }
    let(:device) { user.device }
    let(:sequence) { FactoryGirl.create(:sequence, device: device) }

    it 'destroys a sequence' do
      sign_in user
      input = { id: sequence._id.to_s }
      delete :destroy, input
      expect(response.status).to eq(200)
      expect { sequence.reload }
        .to(raise_error(Mongoid::Errors::DocumentNotFound))
    end

    it 'doesnt destroy other peoples sequence' do
      sign_in user
      other_dudes = FactoryGirl.create(:sequence)
      input = { id: other_dudes._id.to_s }
      delete :destroy, input
      expect(response.status).to eq(403)
    end
  end
end
