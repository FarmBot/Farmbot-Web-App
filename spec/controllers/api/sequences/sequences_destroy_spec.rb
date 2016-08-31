require 'spec_helper'

describe Api::SequencesController do

  include Devise::Test::ControllerHelpers

  describe '#destroy' do


    let(:user) { FactoryGirl.create(:user) }
    let(:device) { user.device }
    let(:sequence) { FactoryGirl.create(:sequence, device: device) }

    it 'destroys a sequence' do
      sign_in user
      input = { id: sequence.id }
      delete :destroy, input
      expect(response.status).to eq(200)
      expect { sequence.reload }
        .to(raise_error(ActiveRecord::RecordNotFound))
    end

    it 'doesnt destroy other peoples sequence' do
      sign_in user
      other_dudes = FactoryGirl.create(:sequence)
      input = { id: other_dudes.id }
      delete :destroy, input
      expect(response.status).to eq(403)
    end
  end
end
