describe Sequences::Update do
  it "does not allow you to modify other peoples sequences" do
    theirs      = FakeSequence.create()
    you         = FactoryBot.create(:device)
    K           = Sequences::Update
    evil_params = {sequence: theirs, device: you, name: "impossible", body: []}
    expect { K.run!(evil_params) }.to raise_error(Errors::Forbidden)
  end
end
