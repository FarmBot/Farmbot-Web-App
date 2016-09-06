require 'spec_helper'

describe Api::RegimensController do

  include Devise::Test::ControllerHelpers

  describe '#update' do
    let(:user) { FactoryGirl.create(:user) }
    let(:sequence) { FactoryGirl.create(:sequence, device: user.device) }
    it 'updates an old regimen' do
      sign_in user

      existing = Regimens::Create.run!(device: user.device, name: "x", color: "red", regimen_items: [])
      payload = {
        "id" => existing.id,
        "name" => "something new",
        "color" => "blue",
        "regimen_items" => [
            {
                "time_offset" => 1555500000,
                "sequence_id" => 1
            },
            {
                "time_offset" => 864300000,
                "sequence_id" => 1
            },
            {
                "time_offset" => 950700000,
                "sequence_id" => 1
            }
        ]
        }
      put :update, payload
      #FINDME TOMORROW MAKE SURE THE MUTATION IS DONE FIRST!!!!!!
      binding.pry
    end
  end
end
