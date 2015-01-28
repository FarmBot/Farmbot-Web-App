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
    json = JSON.parse(response.body)

    if json.is_a?(Array)
      json.map(&:deep_symbolize_keys!)
    else
      json.deep_symbolize_keys!
    end
  end
end
