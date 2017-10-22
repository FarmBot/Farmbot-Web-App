require 'spec_helper'
describe Regimen do
  let(:regimen) { FactoryBot.create(:regimen) }

  it "Enforces uniqueness of names" do
    expect {Regimen.create!(name: regimen.name, device: regimen.device)}.to raise_error(ActiveRecord::RecordInvalid)
  end

end
