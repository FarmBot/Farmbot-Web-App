fixture = {
  kind: "parent",
  args: {},
  body: [
    {
      kind: "child",
      args: { grandchild: { kind: "grandchild", args: {} } }
    }
  ]
}

describe "JSONClimber" do
  it 'Climbs JSON' do
    results = []
    CeleryScript::JSONClimber.climb(fixture) do |hmm|
      results.push(hmm[:kind])
    end
    expect(results).to eq(["parent", "child", "grandchild"])
  end
end
