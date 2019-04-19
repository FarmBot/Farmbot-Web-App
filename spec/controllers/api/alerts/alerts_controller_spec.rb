require "spec_helper"

describe Api::AlertsController do
  include Devise::Test::ControllerHelpers
  let(:user) { FactoryBot.create(:user) }

  it "lists all Alerts for a user" do
    sign_in user
    e = FactoryBot.create(:alert, device: user.device)
    process :index, method: :get
    expect(response.status).to eq(200)
    expect(json.length).to eq(1)
    expect(json.first.fetch(:problem_tag)).to eq(e.problem_tag)
  end

  it "lists all Alerts for a user" do
    sign_in user
    FactoryBot.create(:alert, device: user.device)
    process :destroy, method: :get, params: { id: user.device.alerts.last.id }
    expect(response.status).to eq(200)
    expect(user.device.reload.alerts.count).to eq(0)
  end
end
