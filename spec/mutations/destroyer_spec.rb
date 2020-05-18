require "spec_helper"

describe CreateDestroyer do
  let(:device) { FactoryBot.create(:device) }
  let(:someone_else) { FactoryBot.create(:device) }
  let(:point) { FactoryBot.create(:generic_pointer, device: device) }

  it "creates a destroyer" do
    Destroy = CreateDestroyer.run!(resource: GenericPointer)
    outcome = Destroy.run(generic_pointer: point, device: someone_else)
    expect(outcome.success?).to be(false)
    expect(outcome.errors.message_list).to include("You do not own that generic_pointer")
    expect(point.reload).to be
    Destroy.run!(generic_pointer: point, device: point.device)
    expect(GenericPointer.find_by(id: point.id)).to be(nil)
  end
end
