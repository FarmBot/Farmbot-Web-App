class FakeSequence < Mutations::Command
  def self.create(inputs = {})
    inputs[:device] ||= FactoryBot.create(:device, inputs[:device] || {})
    inputs[:name]   ||= Faker::Company.catch_phrase
    inputs[:color]  ||= Sequence::COLORS.sample
    inputs[:body]   ||= []
    inputs[:args]   ||= {}
    Sequence.find(Sequences::Create.run!(inputs)[:id])
  end

  def self.with_parameters
    create({
      args: {
        version: 9090909090,
        locals: {
          kind: "scope_declaration",
          args: {},
          body: [{
              kind: "parameter_declaration",
              args: { label: "parent" }
            }]
        }
      }
    })
  end
end
