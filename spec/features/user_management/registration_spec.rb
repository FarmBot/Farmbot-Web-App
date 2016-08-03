require 'spec_helper'

# xdescribe 'User Registration' do
#   it 'creates a new user account' do
#     visit root_path
#     fill_in 'user_name', with: 'ricky_ricardo'
#     fill_in 'user_password', with: 'password123'
#     fill_in 'user_email', with: 'test@test.com'
#     fill_in 'user_password_confirmation', with: 'password123'
#     click_button 'Sign Up'
#     expect(page).to have_content 'Welcome! You have signed up successfully.'
#     expect(User.find_by(email: 'test@test.com')).to be
#   end

#   it 'requires a user name' do
#     visit root_path
#     fill_in 'user_password', with: 'password123'
#     fill_in 'user_email', with: 'test@test.com'
#     fill_in 'user_password_confirmation', with: 'password123'
#     click_button 'Sign Up'
#     expect(page).to have_content "Name can't be blank"
#   end
# end
