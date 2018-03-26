require 'spec_helper'

describe Api::RegimensController do

  include Devise::Test::ControllerHelpers

  describe '#create' do
    let(:user) { FactoryBot.create(:user) }
    let(:sequence) { FakeSequence.create( device: user.device) }
    it 'creates a new regimen' do
      sign_in user
      color = %w(blue green yellow orange purple pink gray red).sample

      name = (1..3).map{ Faker::Pokemon.name }.join(" ")
      payload = {
          name: name,
          color: color ,
          regimen_items: [ {time_offset: 123, sequence_id: sequence.id} ]
      }

      old_regimen_count = Regimen.count
      old_item_count = RegimenItem.count

      post :create, params: payload

      expect(response.status).to eq(200)
      expect(Regimen.count).to be > old_regimen_count
      expect(RegimenItem.count).to be > old_item_count
      expect(json[:name]).to eq(name)
      expect(json[:color]).to eq(color)
      expect(json[:in_use]).to eq(false)
    end
  end
end
