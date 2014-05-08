require 'spec_helper'

describe 'User Session' do
  it 'logs the user in' do
    user = FactoryGirl.create(:user)
    visit new_user_session_path
    fill_in 'user_email', with: user.email
    fill_in 'user_password', with: user.password
    click_button 'Sign in'
    expect(page).to have_content('Signed in successfully.')
  end

  it 'edits user settings' do
    user = FactoryGirl.create(:user)
    sign_in_as(user)
    visit edit_user_registration_path
    old_email = user.email
    new_email = Faker::Internet.email
    fill_in 'user_email', with: new_email
    fill_in 'user_current_password', with: user.password
    click_button 'Update'
    expect(page).to have_content('Your account has been updated successfully.')
    expect(user.reload.email).to eq(new_email)
  end

  it 'logs the user out' do
    user = FactoryGirl.create(:user)
    sign_in_as(user)
    click_link 'Sign out'
    expect(page).to have_content('Signed out successfully.')
  end
end