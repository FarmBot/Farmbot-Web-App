require "spec_helper"

describe FarmEvent do
  it 'is allowed to own a fragment' do
    expect(FarmEvent.new.fragment_owner?).to eq(true)
  end
end
