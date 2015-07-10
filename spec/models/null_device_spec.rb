# require 'spec_helper'
describe NullDevice do
  let(:device) { NullDevice.new }

  it 'indicates next_occurrence' do
    [:save, :save!].each do |meth| # not even once.
      expect { device.send(meth) }.to raise_error(
        "Cant call #{meth} on a NullDevice")
    end
  end
end
