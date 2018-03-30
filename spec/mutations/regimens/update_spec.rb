require 'spec_helper'

describe Regimens::Update do
  let(:sequence) { FakeSequence.create() }
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
        regimen: existing_reg,
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
    result = Regimens::Update.run!(new_reg_params).reload
    expect(result.name).to eq(new_reg_params[:name])
    expect(result.color).to eq(new_reg_params[:color])
    expect(result.regimen_items.count).to eq(new_reg_params[:regimen_items].count)
  end
end
