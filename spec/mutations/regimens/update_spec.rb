require 'spec_helper'

describe Regimens::Update do
  let(:sequence) { FactoryGirl.create(:sequence) }
  let(:device) { sequence.device }

  it 'updates an existing regimen' do
    existing_reg = Regimens::Create.run!({
      device: device,
      name: "TESTME",
      color: "purple",
      regimen_items: []
    })

    new_reg_params = {
        device: device,
        id: existing_reg.id,
        name: "NEW NAME",
        color: "red",
        regimen_items: [
            {
                time_offset: 518700000,
                sequence_id: sequence.id
            },
            {
                time_offset: 864300000,
                sequence_id: sequence.id
            }
       ]}
    result = Regimens::Update.run!(new_reg_params)
    # THIS MUTATION TEST DOES NOT WORK THEREFORE THE API TEST DOES NOT WORK. FINDME TOMORROW
    binding.pry
  end
end
