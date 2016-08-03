require 'spec_helper'

describe KeyGen do
  it 'generates a key' do
    file = Tempfile.new('foo')
    result = KeyGen.generate_new_key(file)
    expect(result.to_pem).to eq(file.read)
    file.close
    file.unlink
  end
end
