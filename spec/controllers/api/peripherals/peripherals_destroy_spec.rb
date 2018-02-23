require 'spec_helper'

describe Api::PeripheralsController do
  include Devise::Test::ControllerHelpers
  describe '#destroy' do
    let(:user) { FactoryBot.create(:user) }
    let(:peripheral) { FactoryBot.create(:peripheral, device: user.device,
                                                      label:   "wow") }

    it 'deletes a Peripheral' do
      sign_in user
      # Sequence.destroy_all
      peripheral
      before = Peripheral.count
      delete :destroy, params: { id: peripheral.id }
      expect(response.status).to eq(200)
      expect(before > Peripheral.count).to be_truthy
    end

    it 'prevents unauthorized deletion' do
      sign_in user
      peripheral = FactoryBot.create(:peripheral)
      delete :destroy, params: { id: peripheral.id }
      before = Peripheral.count
      expect(response.status).to eq(404)
      expect(before == Peripheral.count).to be_truthy
      expect(json[:error]).to include("not found")
    end

    it 'prevents deletion of in-use peripherals' do
      sign_in user
      peripheral
      before = Peripheral.count
      FactoryBot.create(:sequence,
                        device: user.device,
                        body: [{kind: "read_pin",
                                args: {
                                  pin_number: {
                                    kind: "named_pin",
                                    args: { pin_type: "Peripheral", pin_id: peripheral.id }
                                  },
                                  mode: 0,
                                  label: "FOO"
                                }
                              }])
      delete :destroy, params: { id: peripheral.id }
      expect(response.status).to eq(422)
      expect(Peripheral.count).to eq(before)
      expect(json[:peripheral]).to include("still using it")
    end
  end
end
