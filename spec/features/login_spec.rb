require "spec_helper"

describe "the signin process", type: :feature, js: true do
  let!(:user) { FactoryBot.create(:user) }

  it "signs me in" do
    visit "http://localhost:3000/"
    binding.pry
    within(".widget-body") do
      fill_in "email",    with: "user@example.com"
      fill_in "password", with: "password"
      click_button "Login"
    end
    expect(page).to have_content "Success"
  end
end
