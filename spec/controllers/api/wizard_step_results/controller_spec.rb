require "spec_helper"

describe Api::WizardStepResultsController do
  let(:user) { FactoryBot.create(:user) }
  include Devise::Test::ControllerHelpers

  it "creates a wizard step result" do
    sign_in user
    s     = user.device
    input = { slug: "MY_SLUG" }
    b4    = WizardStepResult.count
    post :create, body: input.to_json, params: { format: :json}
    expect(response.status).to eq(200)
    expect(WizardStepResult.count).to be > b4
    expect(json[:slug]).to eq("MY_SLUG")
  end

  it "updates a wizard step result" do
    sign_in user
    s     = user.device
    wsr   = FactoryBot.create(:wizard_step_result, device: user.device)
    b4    = WizardStepResult.count
    patch :update,
          format: :json,
          body: { slug: "MY_SLUG" }.to_json,
          params: { id: wsr.id }
    expect(response.status).to eq(200)
    expect(json[:slug]).to eq("MY_SLUG")
    expect(wsr.reload.slug).to eq("MY_SLUG")
  end

  it "deletes a wizard step result" do
    sign_in user
    id = FactoryBot.create(:wizard_step_result, device: user.device).id
    delete :destroy, params: { id: id }
    expect(response.status).to eq(200)
    expect(WizardStepResult.where(id: id).count).to eq(0)
  end

  it "lists wizard step results" do
    sign_in user
    expect(user.device.wizard_step_results.length).to be(0)
    actual = 4
      .times
      .to_a
      .map { FactoryBot.create(:wizard_step_result, device: user.device).slug }
      .sort
    get :index, format: :json
    expect(response.status).to eq(200)
    expect(actual).to eq(json.pluck(:slug).sort)
  end
end
