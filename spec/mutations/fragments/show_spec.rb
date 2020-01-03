require "spec_helper"

describe Fragments::Create do
  class StubLog
    attr_accessor :logs
    ALIAS_MAP = { debug?: :yes,
                  errror?: :no,
                  warn?: :no,
                  error: :doit,
                  warn: :doit,
                  debug: :doit }

    def logs; @logs ||= []; end
    def no; false; end
    def yes; true; end
    def reset; @logs = []; end
    def count; logs.length; end
    def doit(m); logs.push(m); end

    ALIAS_MAP.map { |(from, to)| alias_method from, to }
  end

  let(:device) { FactoryBot.create(:device) }
  let(:tool) { FactoryBot.create(:tool, device: device) }
  let(:point) { FactoryBot.create(:generic_pointer, device: device) }
  let(:farm_event) { FactoryBot.create(:farm_event, device: device) }

  it "reconstructs CeleryScript from the database" do
    origin = {
      device: device,
      kind: "internal_farm_event",
      args: {},
      body: [
        {
          kind: "parameter_application",
          args: {
            label: "myLabel123",
            data_value: { kind: "coordinate", args: { x: 0, y: 1, z: 2 } },
          },
        },
        {
          kind: "parameter_application",
          args: {
            label: "other thing",
            data_value: { kind: "tool", args: { tool_id: tool.id } },
          },
        },
      ],
    }
    flat_ast = Fragments::Preprocessor.run!(**origin)
    fragment = Fragments::Create.run!(flat_ast: flat_ast, owner: farm_event)
    result = Fragments::Show.run!(owner: farm_event)
    diff = Hashdiff.diff(origin.without(:device), result.deep_symbolize_keys)
    expect([]).to eq(diff)
    expect(diff.length).to eq(0)
  end

  it "prevents N+1" do
    a2z = (("a".."z").to_a + ("0".."9").to_a)
    body = a2z.map do |label|
      {
        kind: "parameter_application",
        args: {
          label: label,
          data_value: {
            kind: "coordinate",
            args: {
              x: 0,
              y: 1,
              z: 2,
            },
          },
        },
      }
    end
    origin = { device: device,
               kind: "internal_farm_event",
               args: {},
               body: body }

    old_logger = config.logger
    spy_logger = StubLog.new
    config.logger = spy_logger
    fragment = Fragments::Create.run!(device: device,
                                      owner: farm_event,
                                      flat_ast: Fragments::Preprocessor.run!(**origin))
    # Warm the cache up with two dry-runs:
    Fragments::Show.run!(owner: farm_event)
    Fragments::Show.run!(owner: farm_event)
    spy_logger.reset
    expect(spy_logger.count).to eq(0)
    Fragments::Show.run!(owner: farm_event)
    # If you break this test, it is a sign that:
    # * you have introduced a database performance regression.
    # * you have introduced some other issue that's causing rails to
    #   create debug logs (coincidence?)
    expect(spy_logger.count).to be < 14 # See note above
    config.logger = old_logger
  end
end
