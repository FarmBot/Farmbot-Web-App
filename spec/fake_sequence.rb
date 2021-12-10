class FakeSequence < Mutations::Command
  def self.create(inputs = {})
    inputs[:device] ||= FactoryBot.create(:device, inputs[:device] || {})
    FactoryBot.create(:user, device: inputs[:device]) if inputs[:device].users.empty?
    inputs[:name] ||= Faker::Company.catch_phrase
    inputs[:color] ||= Sequence::COLORS.sample
    inputs[:body] ||= []
    inputs[:args] ||= {}
    Sequence.find(Sequences::Create.run!(inputs)[:id])
  end

  def self.with_parameters(inputs = {})
    create({
      args: {
        version: 9090909090,
        locals: {
          kind: "scope_declaration",
          args: {},
          body: [{
            kind: "parameter_declaration",
            args: {
              label: "parent",
              default_value: {
                kind: "coordinate",
                args: { x: 4, y: 4, z: 4 },
              },
            },
          }],
        },
      },
    }.merge(inputs))
  end
end
