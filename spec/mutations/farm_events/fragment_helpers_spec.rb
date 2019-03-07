require "spec_helper"

describe FarmEvents::FragmentHelpers do
  class StubReceiver
    include FarmEvents::FragmentHelpers

    def has_body?
      true
    end
  end

  it "forces you to be in a transaction when wrapping a fragment" do
    x = StubReceiver.new
    error = FarmEvents::FragmentHelpers::TRANSACTION_REQUIRED
    expect { x.wrap_fragment_with({}) }.to raise_error(error)
  end
end
