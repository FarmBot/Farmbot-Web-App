require 'spec_helper'

describe Api::StepsController do

  include Devise::TestHelpers

  describe '#create' do

    let(:user) { FactoryGirl.create(:user) }
    let(:sequence) { FactoryGirl.create(:sequence) }

    it 'destroys a step sequence'
    it 'handles 404 for step'
  end
end
