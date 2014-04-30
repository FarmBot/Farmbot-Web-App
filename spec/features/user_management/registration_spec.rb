require 'spec_helper'

describe 'User Registration' do
  it 'creates a new user account' do
    visit root_path
    fill_in 'user_name', with: 'ricky_ricardo'
    fill_in 'user_password', with: 'password123'
    fill_in 'user_password_confirmation', with: 'password123'
    click 'Next Step'
    expect(page).to have_content 'Farmbot'
  end
end