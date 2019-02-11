require "spec_helper"

describe Primitive do
  it 'only allows primitive `value`s' do
    expect(Primitive.new(value: {}).valid?).to eq(false)
  end

  it 'has a max length' do
    lengthy = ("*" * Primitive::LENGTH_LIMIT) + "..."
    expect(Primitive.new(value: lengthy).valid?).to eq(false)
  end
end
