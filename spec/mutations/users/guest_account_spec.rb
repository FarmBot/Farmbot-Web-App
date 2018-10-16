require "spec_helper"

describe Users::GuestAccount do
  it "Creates a guest account" do
    guest = Users::GuestAccount.run!
    binding.pry
  end
end
