describe DashboardController do
  include Devise::Test::ControllerHelpers
  let(:user) { FactoryBot.create(:user, confirmed_at: nil) }
  render_views

  it 'can not re-verify' do
    user.update(confirmed_at: Time.now)
    sign_in user
    get :confirmation_page, params: { token: user.confirmation_token }
    expect(response.status).to eq(409)
    expect(response.body).to include("already verified")
  end
end
