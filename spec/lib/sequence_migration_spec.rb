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

describe SequenceMigration do
  it 'has a latest version' do
      expect(SequenceMigration::Base.latest_version).to eq(5)
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
  end
end
