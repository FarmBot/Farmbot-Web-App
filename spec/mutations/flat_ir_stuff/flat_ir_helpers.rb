module CeleryScript
class FlatIrHelpers
    def self.typical_sequence
      {
        kind: "sequence",
        name: "move_abs(1,2,3), move_rel(4,5,6), write_pin(13, off, digital)",
        color: "gray",
        args: {
          locals: { kind: "scope_declaration", args: {}, body: [] },
          version: 6,
          label: "move_abs(1,2,3), move_rel(4,5,6), write_pin(13, off, digital)"
        },
        body: [
          {
            kind: "move_absolute",
            args: {
              location: { kind: "coordinate", args: { x: 0, y: 0, z: 0 } },
              offset: { kind: "coordinate", args: { x: 0, y: 0, z: 0 } },
              speed: 100
            }
          },
          {
            kind: "move_relative",
            args: { x: 0, y: 0, z: 0, speed: 100 }
          },
          {
            kind: "write_pin",
            args: { pin_number: 0, pin_value: 0, pin_mode: 0 }
          }
        ]
      }
    end

    def self.flattened_heap
      slicer = CeleryScript::Slicer.new
      slicer.run!(typical_sequence)
      slicer.heap_values
    end

    def self.fake_first_pass
      fake_tree = {
      kind: 'sequence',
      args: { locals: { kind: 'scope_declaration', args: {}, body: [] } },
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