module CeleryScript
  # Some helpers to DRY up Flat IR unit tests.
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

    def self.typical_sequence2
      {
        kind: 'sequence',
        args: { locals: { kind: 'scope_declaration', args: {}, body: [] } },
        body: [
          { kind: 'take_photo', args: {} },
          {
            kind: 'send_message',
            args: { message: 'test case 1', message_type: 'success' },
            body: [
              { kind: 'channel', args: { channel_name: 'toast' } },
            ],
          },
          {
            kind: '_if',
            args: {
              lhs: 'x',
              op: 'is',
              rhs: 0,
              _then: { kind: 'execute', args: { sequence_id: 10 } },
              _else: { kind: 'nothing', args: {} }
            }
          },
        ]
      }
    end

    def self.flattened_heap
      slicer = CeleryScript::Slicer.new
      slicer.run!(typical_sequence2)
      slicer.heap_values
    end

    def self.fake_first_pass
      FakeSequence.create( body: typical_sequence[:body])
    end
  end
end
