# require 'spec_helper'

# describe Api::PeripheralsController do
#   include Devise::Test::ControllerHelpers

#   describe '#update' do
#     let(:user) { FactoryGirl.create(:user) }

#     it 'allows authorized modification' do
#       sign_in user
#       id = FactoryGirl.create(:peripheral, device: user.device).id
#       input = { id: id, pin: 9 }
#       patch :update, input
#       expect(response.status).to eq(200)
#       expect(json[:pin]).to eq(9)
#     end

#     it 'prevents unauthorized modification' do
#       sign_in user
#       id = FactoryGirl.create(:peripheral).id
#       input = { id: id, pin: 9 }
#       patch :update, input
#       expect(response.status).to eq(403)
#       expect(json[:error]).to include('Not your Peripheral')
#     end
#   end
# end
