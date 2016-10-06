require 'spec_helper'

describe Sequences::Create do
  let(:user) { FactoryGirl.create(:user) }
  let(:device) { user.device }

  end

  name = Faker::Pokemon.name
  let(:sequence_params) do
    { device: device,
      name: name }
  end

  it 'Builds a `sequence`' do
    seq = Sequences::Create.run!(sequence_params)
    expect(seq.name).to eq(name)
    expect(seq.device).to eq(device)
  end
end
