fixture = {
  kind: "parent",
  args: {},
  body: [
    {
      kind: "child",
      args: { grandchild: { kind: "grandchild", args: {} } },
    },
  ],
}

describe "JsonClimber" do
  it "Climbs JSON" do
    results = []
    CeleryScript::JsonClimber.climb(fixture) do |hmm|
      results.push(hmm[:kind])
    end
    expect(results).to eq(["parent", "child", "grandchild"])
  end
end
