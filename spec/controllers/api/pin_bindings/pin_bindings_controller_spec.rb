require 'spec_helper'

describe Api::PinBindingsController do
    include Devise::Test::ControllerHelpers
    describe '#index' do
    let(:user) { FactoryBot.create(:user) }
    let(:device) { user.device }
    let(:pin_bindings) { FactoryBot.create_list(:pin_binding, 3, device: device) }
    let(:pin_binding) { pin_bindings.first }

    it 'lists all pin_bindings' do
      PinBinding.destroy_all
      pin_bindings
      sign_in user
      get :index
      expect(response.status).to eq(200)
      expect(json.map { |x| x[:id] }).to include(pin_bindings.first.id)
      expect(json.length).to eq(pin_bindings.length)
    end

    it 'shows one pin binding' do
      sign_in user
      get :show, params: { format: :json, id: pin_binding.id }
      expect(response.status).to eq(200)
      expect(json[:id]).to eq(pin_binding.id)
    end

    it 'destroys a pin_binding' do
      sign_in user
      id = pin_binding.id
      delete :destroy, params: { format: :json, id: id }
      expect(response.status).to eq(200)
      expect(PinBinding.exists?(id)).to be false
    end

    it 'creates a pin binding' do
      sign_in user
      s     = FakeSequence.create( device: device)
      input = { pin_num: 12, sequence_id: s.id}
      b4    = PinBinding.count
      post :create, body: input.to_json, params: { format: :json}
      expect(response.status).to eq(200)
      expect(PinBinding.count).to be > b4
      input.map do |(key, _)|
        expect(json[key]).to eq(input[key])
      end
    end

    it 'weeds out bad sequence ids' do
      sign_in user
      s     = FakeSequence.create( device: device)
      input = { pin_num: 1, sequence_id: 0 }
      b4    = PinBinding.count
      post :create, body: input.to_json, params: { format: :json}
      expect(response.status).to eq(422)
      expect(json[:sequence_id]).to eq("Sequence ID is not valid")
    end

    it 'updates pin bindings' do
      sign_in user
      s     = FakeSequence.create( device: device)
      input = { pin_num: pin_binding.pin_num + 1, sequence_id: s.id}
      put :update,
        body: input.to_json,
        params: { format: :json, id: pin_binding.id}
      expect(response.status).to eq(200)
      pin_binding.reload
      input.map do |(key, _)|
        expect(json[key]).to eq(input[key])
        expect(pin_binding[key]).to eq(input[key])
      end
    end

    it 'disallows pin 17' do
      sign_in user
      s     = FakeSequence.create( device: device)
      input = { pin_num: 17, sequence_id: s.id}
      b4    = PinBinding.count
      post :create, body: input.to_json, params: { format: :json}
      expect(response.status).to eq(422)
      expect(json[:pin_num]).to include("Pin numbers 17 and 23 cannot be used.")
    end

    it 'disallows pin 23' do
      sign_in user
      s     = FakeSequence.create( device: device)
      input = { pin_num: 23, sequence_id: s.id}
      put :update,
        body: input.to_json,
        params: { format: :json, id: pin_binding.id}
      expect(response.status).to eq(422)
      expect(json[:pin_num]).to include("Pin numbers 17 and 23 cannot be used.")
    end
  end
end
