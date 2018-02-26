require "spec_helper"

describe "the signin process", type: :feature, js: true do
  password = "password123"
  let!(:user) { FactoryBot.create(:user, password: password) }
  login_form_selector = \
    "div.col-sm-5:nth-child(1) > div:nth-child(1) >"\
    " div:nth-child(2) > form:nth-child(1)"

  it "signs me in" do
    visit front_page_url
    within(login_form_selector) do
      fill_in "login_email",    with: user.email
      fill_in "login_password", with: user.password
      fill_in "login_email",    with: "" # Trigger blur event
      click_button "Login"
    end
    sleep 3
    expect(page).to have_content "MOTOR COORDINATES (MM)"
  end
end
