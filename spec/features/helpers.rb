module Helpers
  def sign_in_as(user)
    #TODO: Sign in via Warden instead.
    visit new_user_session_path
    fill_in 'user_email', with: user.email
    fill_in 'user_password', with: user.password
    click_button 'Sign in'
  end
end