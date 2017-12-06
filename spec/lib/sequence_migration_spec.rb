require 'spec_helper'

FIXTURE = JSON.parse('[
  {
     "kind":"move_absolute",
     "args":{
        "location":{
           "kind":"coordinate",
           "args":{
              "x":0,
              "y":0,
              "z":0
           }
        },
        "offset":{
           "kind":"coordinate",
           "args":{
              "x":0,
              "y":0,
              "z":0
           }
        },
        "speed":200
     },
     "uuid":"c1d740a1-5807-42dd-949f-3f28993d96bc"
  },
  {
     "kind":"move_relative",
     "args":{
        "x":0,
        "y":0,
        "z":0,
        "speed":200
     },
     "uuid":"003101ee-63b6-4a41-bfe8-cdd6b95480ea"
  },
  {
     "kind":"find_home",
     "args":{
        "axis":"all",
        "speed":200
     },
     "uuid":"7be663f7-56ff-4b77-9356-49e965a8fa87"
  }
]')

class MockMigration < SequenceMigration::Base
  VERSION = -9
end

class MockMigrationTwo < SequenceMigration::Base
  VERSION = 1
end

describe SequenceMigration do
  it 'has a latest version' do
      expect(SequenceMigration::Base.latest_version).to eq(6)
  end

  it 'updates speed on all the things < v5' do
    s = FactoryBot.create(:sequence)
    s.args["version"] = 4
    s.body            = FIXTURE
    expect(s.body[0]["args"]["speed"]).to eq(200)
    expect(s.body[1]["args"]["speed"]).to eq(200)
    expect(s.body[2]["args"]["speed"]).to eq(200)

    s.maybe_migrate

    expect(s.body[0]["args"]["speed"]).to eq(100)
    expect(s.body[1]["args"]["speed"]).to eq(100)
    expect(s.body[2]["args"]["speed"]).to eq(100)
    expect(s.args.dig("locals","kind")).to eq("scope_declaration")
  end

  it 'warns developers that `up()` is required' do
    base = SequenceMigration::Base.new(FactoryBot.create(:sequence))
    expect { base.up }.to raise_error(SequenceMigration::Base::UP_IS_REQUIRED)
  end

  it 'checks for appropriate version number when running `before()`' do
    base = MockMigration.new(FactoryBot.build(:sequence))
    expect { base.before }
      .to raise_error("Version must be -10 to run MockMigration. Got: 4")
  end

  it 'sorts migrations by version number' do
    allow(SequenceMigration::Base)
      .to receive(:descendants) { [MockMigration, MockMigrationTwo] }
    sequence                 = FactoryBot.build(:sequence)
    sequence.args["version"] = -10
    result                   = SequenceMigration::Base.generate_list(sequence)
    expect(result.first).to be_kind_of(MockMigration)
    expect(result.last).to  be_kind_of(MockMigrationTwo)
  end
end
