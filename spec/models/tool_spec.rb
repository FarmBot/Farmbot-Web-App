require "spec_helper"

describe Tool do
  describe 'names' do
    let(:tool) { FactoryBot.create(:tool) }
    it 'must be unique' do
      tool2 = Tool.create(name: tool.name, device: tool.device)
      expect(tool2.valid?).to be(false)
      expect(tool2.errors.messages[:name]).to include("has already been taken")
    end
  end
end
