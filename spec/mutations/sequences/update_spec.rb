describe Sequences::Update do
  it "does not allow you to modify other peoples sequences" do
    theirs      = FakeSequence.create()
    you         = FactoryBot.create(:device)
    K           = Sequences::Update
    evil_params = {sequence: theirs, device: you, name: "impossible", body: []}
    expect { K.run!(evil_params) }.to raise_error(Errors::Forbidden)
  end

  it "updates sequence folder_id" do
    device = FactoryBot.create(:device)
    folder = Folder.create!(name: "My Folder",
                            color: "green",
                            device: device)
    sequence = FakeSequence.create(device: device)
    result = Sequences::Update.run!(sequence: sequence,
                                    name: "My Sequence",
                                    device: device,
                                    folder_id: folder.id,
                                    body: [])
    expect(sequence.folder_id).to equal(folder.id)
  end
end
