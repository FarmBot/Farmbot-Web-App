require "spec_helper"

describe Tool do
  it "defaults type and effector offsets" do
    tool = FactoryBot.create(:tool)

    expect(tool.type).to eq("none")
    expect(tool.utm_mountable).to be true
    expect(tool.effector_offset_x).to eq(0)
    expect(tool.effector_offset_y).to eq(0)
    expect(tool.effector_offset_z).to eq(0)
  end

  describe 'names' do
    let(:tool) { FactoryBot.create(:tool) }
    it 'must be unique' do
      tool2 = Tool.create(name: tool.name, device: tool.device)
      expect(tool2.valid?).to be(false)
      expect(tool2.errors.messages[:name]).to include("has already been taken")
    end
  end

  it "validates type" do
    tool = FactoryBot.build(:tool, type: "invalid")

    expect(tool.valid?).to be false
    expect(tool.errors[:type].first).to include("must be one of")
  end
end
