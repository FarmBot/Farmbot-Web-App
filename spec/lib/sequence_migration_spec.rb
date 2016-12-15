require 'spec_helper'

describe SequenceMigration do
  it 'has a latest version' do
      expect(SequenceMigration.latest_version).to eq(1)
  end

  it 'updates latest version when migrations are added' do
    class Whatever < SequenceMigration; VERSION = 999; end
    expect(SequenceMigration.latest_version).to eq(999)
  end
end
