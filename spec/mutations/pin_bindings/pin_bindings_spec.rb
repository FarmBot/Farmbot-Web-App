require "spec_helper"

module PinBindingSpecHelper
  def self.test(mutation, has_seq, has_actn, expected_result)
    actn                    = PinBinding.special_actions.values.sample
    sequence                = Sequence.last
    device                  = sequence.device
    pb                      = PinBinding.last
    pn                      = pb.random_pin_num
    params                  = { pin_num:     pn,
                                device:      device,
                                pin_binding: PinBinding.last }
    params[:special_action] = actn        if has_actn
    params[:sequence_id]    = sequence.id if has_seq
    mut = (mutation == :create) ? PinBindings::Create : PinBindings::Update
    result = mut.run(params).success?
    raise "NO NO NO" if expected_result != result
  end
end

describe "Pin Binding updates" do
  it "enforces mutual exclusivity" do
    Device.destroy_all
    [Point, Tool, PinBinding, Sequence].map(&:destroy_all)
    device = FactoryBot.create(:device)
    PinBinding.create!(device: device)
    Sequence.create!(device: device, name: "test")
    PinBindingSpecHelper.test(:create, false, false, false)
    PinBindingSpecHelper.test(:create, false, true,  true )
    PinBindingSpecHelper.test(:create, true,  false, true )
    PinBindingSpecHelper.test(:create, true,  true,  false)
    PinBindingSpecHelper.test(:update, false, false, true )
    PinBindingSpecHelper.test(:update, false, true,  true )
    PinBindingSpecHelper.test(:update, true,  false, true )
    PinBindingSpecHelper.test(:update, true,  true,  false)
  end
end
