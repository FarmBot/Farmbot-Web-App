describe SequenceDependency do
  let(:parent) { FactoryGirl.create(:sequence) }
  let(:child1) { FactoryGirl.create(:sequence) }
  let(:child2) do
    Point.create!(x:       1,
                  y:       2,
                  z:       3,
                  pointer: Plant.create!()).pointer
  end

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
