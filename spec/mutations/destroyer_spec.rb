require "spec_helper"

describe CreateDestroyer do
  class FakeResource
    def self.model_name
      ""
    end
  end

  it "destroys a fake resource" do
    Destroy = CreateDestroyer.run!(resource: FakeResource)
    Destroy.run!(resource: FakeResource.new)
  end
end
