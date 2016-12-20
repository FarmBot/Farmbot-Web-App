require 'spec_helper'
# Real world examples in use as of 19 DEC 16
BODY = [
 {"kind"=>"move_absolute", "args"=>{"x"=>0, "y"=>0, "z"=>0, "speed"=>100}},
 {"kind"=>"move_absolute", "args"=>{"x"=>0, "y"=>0, "z"=>0, "speed"=>200}},
 {"kind"=>"move_absolute", "args"=>{"x"=>0, "y"=>1000, "z"=>0, "speed"=>200}},
 {"kind"=>"move_absolute", "args"=>{"x"=>10, "y"=>50, "z"=>15, "speed"=>100}},
 {"kind"=>"move_absolute", "args"=>{"x"=>0, "y"=>0, "z"=>0, "speed"=>100}},
 {"kind"=>"move_absolute", "args"=>{"x"=>0, "y"=>0, "z"=>0, "speed"=>100}},
 {"kind"=>"move_absolute", "args"=>{"x"=>0, "y"=>0, "z"=>0, "speed"=>200}},
 {"kind"=>"move_absolute", "args"=>{"x"=>0, "y"=>1000, "z"=>0, "speed"=>200}},
 {"kind"=>"execute", "args"=>{"sub_sequence_id"=>5}},
 {"kind"=>"execute", "args"=>{"sub_sequence_id"=>6}},
 {"kind"=>"execute", "args"=>{"sub_sequence_id"=>5}},
 {"kind"=>"move_relative", "args"=>{"x"=>49, "y"=>10, "z"=>10, "speed"=>100}},
 {"kind"=>"move_relative", "args"=>{"x"=>0, "y"=>0, "z"=>0, "speed"=>100}},
 {"kind"=>"wait", "args"=>{"milliseconds"=>0}},
 {"kind"=>"wait", "args"=>{"milliseconds"=>1500}},
 {"kind"=>"wait", "args"=>{"milliseconds"=>1500}},
 {"kind"=>"execute", "args"=>{"sub_sequence_id"=>26}},
 {"kind"=>"execute", "args"=>{"sub_sequence_id"=>32}},
 {"kind"=>"execute", "args"=>{"sub_sequence_id"=>32}},
]

describe "Migration from version 0 or nil" do
  let(:user) { FactoryGirl.create(:user) }
  let(:device) { user.device }
  let(:seq) { FactoryGirl.create(:sequence, device: device, body: BODY) }

  it 'Updates `move_absolute` nodes' do
      Sequences::Migrate.run!(device: device, sequence: seq)
      nodes = seq.body.select{ |x| x["kind"] == "move_absolute"}
      args = nodes.map { |x| x["args"].keys }.flatten.uniq
      expect(args).to_not include("x")
      expect(args).to_not include("y")
      expect(args).to_not include("z")
      expect(args).to include("speed")
      expect(args).to include("location")
  end
end
