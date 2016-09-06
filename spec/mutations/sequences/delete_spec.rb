require 'spec_helper'

describe Sequences::Delete do
  let(:sequence)     { FactoryGirl.create(:sequence)  }

  it 'refuses to delete a sequence that a regimen depends on' do
   regimen_item1 = FactoryGirl.create(:regimen_item, sequence: sequence)  
   regimen_item2 = FactoryGirl.create(:regimen_item, sequence: sequence) 
    # regimen = Regimens::Create.run!(
    #     device: sequence2.device,
    #     name: Faker::Pokemon.name,
    #     color: "red",
    #     regimen_items: [
    #       {
    #         time_offset: 129600000,
    #         sequence_id: sequence2.id
    #       }
    #     ]
    # )
    expect(sequence.regimen_items.count).to eq(2)
    result = Sequences::Delete.run!(device: sequence.device, sequence: sequence)
    binding.pry
      
  end

  it 'deletes a sequence' do
    result = Sequences::Delete.run!(device: sequence.device, sequence: sequence)
    expect(result).to eq("")
    expect( Sequence.where(id: sequence.id).count ).to eq(0)
  end
end
