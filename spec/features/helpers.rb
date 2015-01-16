module Helpers
  def sign_in_as(user)
    # For when you're actually testing the login UI components. Otherwise,
    # consider using the devise test helper `sign_in`
    visit new_user_session_path
    fill_in 'user_email', with: user.email
    fill_in 'user_password', with: user.password
    click_button 'Sign in'
  end

  def json
    JSON.parse(response.body).map(&:deep_symbolize_keys!)
  end
end
