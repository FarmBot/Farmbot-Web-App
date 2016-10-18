require 'spec_helper'

describe CeleryScript::Corpus do
  let (:corpus) { Sequence::Corpus }

  it "serializes into JSON" do
      result = JSON.parse(corpus.to_json)

      expect(result["tag"]).to eq(0)
      expect(result["args"]).to be_kind_of(Array)
      expect(result["nodes"]).to be_kind_of(Array)
      expect(result["nodes"].sample.keys.sort).to eq(["allowed_args",
                                                      "allowed_body_types",
                                                      "name"])  
      expect(result["args"].sample.keys.sort).to eq(["allowed_values",
                                                     "name"])  
  end
end