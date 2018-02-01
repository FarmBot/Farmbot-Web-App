module CeleryScript
class FlatIrHelpers
  def self.fake_first_pass
    fake_tree = {
      kind: 'sequence',
      args: {
        locals: {
          kind: 'scope_declaration',
          args: {},
          body: []
        },
      },
      body: [
        {
          kind: 'send_message',
          args: { message: 'test case 1', message_type: 'success' },
          body: [
            { kind: 'channel', args: { channel_name: 'toast' } },
            { kind: 'channel', args: { channel_name: 'email' } },
            { kind: 'channel', args: { channel_name: 'espeak' } } # Test this.
          ],
        },
        { kind: 'take_photo', args: {} },
        {
          kind: '_if',
          args: {
            lhs: 'x',
            op: 'is',
            rhs: 0,
            _then: { kind: 'nothing', args: {} },
            _else: { kind: 'nothing', args: {} }
          }
        },
      ]
    }
    sequence      = FactoryBot.create(:sequence)
    sequence.args = fake_tree[:args]
    sequence.body = fake_tree[:body]
    FirstPass.run!(sequence: sequence)
  end
end
end