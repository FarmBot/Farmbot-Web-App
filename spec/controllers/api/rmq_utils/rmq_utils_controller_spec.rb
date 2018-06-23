require "spec_helper"

describe Api::RmqUtilsController do
  let(:user) { FactoryBot.create(:user) }

  it "validates topic usage"
  it "always denies guest users"
  it "auths admin users, such as the log service"
  it "auths end users and farmbots"
  it "validates vHost"
  it "validates RMQ resource usage"
end
