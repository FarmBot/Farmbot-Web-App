class FakeSequence < Mutations::Command
  KEYS = Set.new

  def self.create(inputs = {})
    inputs.keys.map { |x| KEYS.add(x) }
    puts ("="*10) + KEYS.entries.inspect
    inputs[:device] ||= FactoryBot.create(:device, inputs[:device] || {})
    inputs[:name]   ||= Faker::Company.catch_phrase
    inputs[:color]  ||= Sequence::COLORS.sample
    inputs[:body]   ||= []
    inputs[:args]   ||= {}
    x = Sequences::Create.run!(inputs)
    Sequence.find(x[:id])
  end
end
