require 'spec_helper'
describe Sequence do
  let(:regimen) { FactoryGirl.create(:regimen) }

  it "Enforces uniqueness of names" do

    optns = { device: regimen.device,
                name: "Dupe",
                color: "red" }
    Sequence.create!(optns)
    expect { Sequence.create!(optns) }.to raise_error(ActiveRecord::RecordInvalid)
  end

end
