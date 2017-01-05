require 'spec_helper'

BODY1 = [
  {
    "kind" => "send_message",
    "args" => {
      "message" => "channel warning_toast Bot is at position {{ x }}, "\
                   "{{ y }}, {{ z }}."
    }
  }
]

BODY2 = [
  {
    "kind" => "send_message",
    "args" => {
      "message" => "Bot is ticking at position {{ x }}, {{ y }}, {{ z }}."
    },
    "comment" => "ticker test",
    "body" => [
      {
        "kind" => "channel",
        "args" => {
          "channel_name" => "ticker"
        }
      }
    ]
  }, {
    "kind" => "send_message",
    "args" => {
        "message" => "Bot is erroring at position {{ x }}, {{ y }}, {{ z }}."
  },
    "body" => [
        {
          "kind" => "channel",
          "args" => {
            "channel_name" => "error_ticker"
          }
        }
      ]
  }, {
       "kind" => "send_message",
       "args" => {
         "message" => "Bot is succeeding at position {{ x }}, {{ y }}, {{ z }}."
       },
       "body" => [
           {
             "kind" => "channel",
             "args" => {
               "channel_name" => "success_toast"
             }
           }
         ]
       }, {
        "kind" => "send_message",
        "args" => {
          "message" => "Bot is erroring at position {{ x }}, {{ y }}, {{ z }}."
        },
        "body" => [
          {
            "kind" => "channel",
            "args" => {
              "channel_name" => "error_toast"
            }
          }
        ]
      }, {
          "kind" => "send_message",
          "args" => {
              "message"=>"Bot is warning at position {{ x }}, {{ y }}, {{ z }}."
          },
          "body" => [
            {
              "kind"=>"channel",
              "args"=>{
                "channel_name" => "warning_toast"
              }
            }
          ]
      }
  ]
describe "Migration from version 0 or nil" do
  let(:user) { FactoryGirl.create(:user) }
  let(:device) { user.device }
  let(:seq1) { FactoryGirl.create(:sequence, device: device, body: BODY1) }
  let(:seq2) { FactoryGirl.create(:sequence, device: device, body: BODY2) }

  it 'handles nodes without a body' do
      # BEFORE:
      expect(seq1.body.first["message_type"]).to eq(nil)
      expect(seq1.args["version"]).to eq(nil)

      Sequences::Migrate.run!(device: device, sequence: seq1)

      actual   = seq1.body.dig(0, "args", "message")
      expected = BODY1.dig(0, "args", "message")
      expect(actual).to eq(expected)
      expect(seq1.body.dig(0, "args", "message_type")).to eq("info")
      expect(seq1.args["version"]).to eq(4)
  end

  it 'handles `channel` body nodes' do
      Sequences::Migrate.run!(device: device, sequence: seq2)

      expect(seq2.body.dig(0, "args", "message_type")).to eq("info")
      expect(seq2.args["version"]).to eq(4)
      results = seq2
                  .body
                  .map{|x| x["body"]}
                  .flatten
                  .map{|x| x.dig("args", "channel_name")}
                  .uniq
      expect(results).to eq(["toast"])
  end
end
