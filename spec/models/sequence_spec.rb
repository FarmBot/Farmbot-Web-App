require 'spec_helper'
describe Sequence do
  let(:regimen)     { FactoryBot.create(:regimen) }
  let(:with_params) { FakeSequence.with_parameters.id }
  let(:no_params)   { Sequence.parameterized?(FakeSequence.create.id) }

  it "enforces uniqueness of names" do
    PinBinding.destroy_all
    Sequence.destroy_all
    optns = { device: regimen.device,
              name: "Dupe",
              color: "red" }
    Sequence.create!(optns)
    expect { Sequence.create!(optns) }.to raise_error(ActiveRecord::RecordInvalid)
  end

  it "knows when a sequence is parameterized" do
    expect(Sequence.parameterized?(with_params)).to be(true)
  end

  it "knows when a sequence _isnt_ parameterized" do
    expect(no_params).to be(false)
  end

  it "determines if an array of IDs contains parameterized sequences" do
    expect(Sequence.parameterized?([with_params, no_params])).to eq(true)
    expect(Sequence.parameterized?([no_params])).to eq(false)
  end
end
