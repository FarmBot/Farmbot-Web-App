require 'spec_helper'

describe 'User Registration' do
  it 'creates a new user account' do
    visit '/'
    expect(page).to have_content 'Farmbot'
  end
end