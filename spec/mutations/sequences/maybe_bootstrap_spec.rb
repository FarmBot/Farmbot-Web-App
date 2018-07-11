require "spec_helper"

describe Sequences::MaybeBootstrap do
  it "bootstraps a list of public sequences (only once)" do
    Point.destroy_all
    TokenIssuance.destroy_all
    Device.destroy_all
    Sequence.destroy_all
    ps = Sequences::MaybeBootstrap::PUBLIC_SEQUENCES

    Sequences::MaybeBootstrap.run!
    expect(Device.count).to eq(1)
    expect(Sequence.count).to eq(ps.count)

    Sequences::MaybeBootstrap.run!
    expect(Device.count).to eq(1)
    expect(Sequence.count).to eq(ps.count)
  end
end
