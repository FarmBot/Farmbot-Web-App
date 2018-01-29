describe FirstPass do
  it "prepares a list of unsaved PrimaryNode records" do
    Sequence.destroy_all
    expect(EdgeNode.count).to be(0)
    expect(PrimaryNode.count).to be(0)
    # FirstPass does not validate in any way-
    #   fake_tree is syntactically correct, but not
    #   semantically correct. It doesn't matter
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
  end
end