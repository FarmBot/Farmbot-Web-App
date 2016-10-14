describe SequenceDependency do
  let(:parent) { FactoryGirl.create(:sequence) }
  let(:child1) { FactoryGirl.create(:sequence) }
  let(:child2) { Plant.create }

  it 'depends upon another sequence' do
    sd = SequenceDependency.create(sequence:   parent,
                                   dependency: child1)
    expect(sd.valid?).to eq(true)
  end

  it 'depends upon a plant' do
    sd = SequenceDependency.create(sequence:   parent,
                                   dependency: child2)
    expect(sd.valid?).to eq(true)
  end  
end
