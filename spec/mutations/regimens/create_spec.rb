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
      items: [
        {
          timeOffset: 129600000,
          sequence_id: seq1._id.to_s
        }, {
          timeOffset: 259200000,
          sequence_id: seq2._id.to_s
        }
      ]
    }
    result = Regimens::Create.run!(optns)
    binding.pry
  end
end
