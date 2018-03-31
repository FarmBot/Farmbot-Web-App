require "spec_helper"

describe CreateAttachmentFromUrlJob do
  it "Has a max_attempts property of 2" do
    expect(CreateAttachmentFromUrlJob.new.max_attempts).to eq(2)
  end
end
