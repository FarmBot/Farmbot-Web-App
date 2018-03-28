require "spec_helper"

describe Sequences::Delete do
  let(:sequence)     { FakeSequence.create()  }

  it "Cant delete sequences in use by farm events" do
    fe = FactoryBot.create(:farm_event, executable: sequence)
    result = Sequences::Delete.run(device: sequence.device, sequence: sequence)
    expect(result.success?).to be false
    errors = result.errors.message
    expect(errors.keys).to include("sequence")
    expect(errors["sequence"]).to include("in use")
    expect(errors["sequence"]).to include(fe.fancy_name)
  end

  it "refuses to delete a sequence that a regimen depends on" do
    regimen_item1 = FactoryBot.create(:regimen_item, sequence: sequence)
    regimen_item2 = FactoryBot.create(:regimen_item, sequence: sequence)
    expect(sequence.regimen_items.count).to eq(2)
    result = Sequences::Delete.run(device: sequence.device, sequence: sequence)
    expect(result.success?).to be false
    errors = result.errors.message
    expect(errors.keys).to include("sequence")
    expect(errors["sequence"]).to include("in use")
    expect(errors["sequence"]).to include(regimen_item1.regimen.fancy_name)
    expect(errors["sequence"]).to include(regimen_item2.regimen.fancy_name)
  end

  it "deletes a sequence" do
    result = Sequences::Delete.run!(device: sequence.device, sequence: sequence)
    expect(result).to eq("")
    expect( Sequence.where(id: sequence.id).count ).to eq(0)
  end

  it "prevents deletion when the sequence is in use by another sequence" do
    Sequences::Create.run!(device: sequence.device,
                           name: "dep",
                           body: [
                            {
                              kind: "execute",
                              args: { sequence_id: sequence.id }
                            }
                          ])
    result = Sequences::Delete.run(device: sequence.device, sequence: sequence)
    expect(result.success?).to be(false)
    expect(result.errors.has_key?("sequence")).to be(true)
    message = result.errors["sequence"].message
    expect(message).to include("in use")
    expect(message).to include("dep")
  end
end
