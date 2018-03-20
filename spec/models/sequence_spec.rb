require 'spec_helper'
describe Sequence do
  let(:regimen) { FactoryBot.create(:regimen) }

  it "Enforces uniqueness of names" do
    PinBinding.destroy_all
    Sequence.destroy_all
    optns = { device: regimen.device,
              name: "Dupe",
              color: "red" }
    Sequence.create!(optns)
    expect { Sequence.create!(optns) }.to raise_error(ActiveRecord::RecordInvalid)
  end

  it "picks random values" do
    FakeSequence.create()
    5.times { expect(Sequence.random).to be_kind_of(Sequence) }
  end
end
