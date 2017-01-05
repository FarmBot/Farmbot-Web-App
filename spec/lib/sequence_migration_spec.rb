require 'spec_helper'

describe SequenceMigration do
  it 'has a latest version' do
      expect(SequenceMigration::Base.latest_version).to eq(4)
  end
end
