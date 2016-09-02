require 'spec_helper'

describe Regimens::Create do
  it 'Builds a regimen' do
    seq1 = FactoryGirl.create(:sequence)
    seq2 = FactoryGirl.create(:sequence, device: seq1.device)
    device = seq1.device
    optns = {
      device: device,
      name: "My test regimen",
      color: "red",
      regimen_items: [
        {
          time_offset: 129600000,
          sequence_id: seq1.id
        }, {
          time_offset: 259200000,
          sequence_id: seq2.id
        }
      ]
    }
    result = Regimens::Create.run!(optns).reload
    expect(result.regimen_items.length).to eq(2)
    expect(result.regimen_items.first.time_offset).to eq(129600000)
    expect(result.device).to eq(device)
    expect(result.name).to eq("My test regimen")
    expect(result.color).to eq("red")
    expect(result.regimen_items.first.sequence).to eq(seq1)
  end
end
