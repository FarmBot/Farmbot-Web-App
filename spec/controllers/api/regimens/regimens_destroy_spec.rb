describe Api::RegimensController do

  include Devise::Test::ControllerHelpers

  describe '#index' do
    let(:user) { FactoryGirl.create(:user) }
    let!(:regimen) { FactoryGirl.create(:regimen, device: user.device) }

    it 'retrieves all regimina' do
      sign_in user
      old_count = Regimen.count
      delete :destroy, { id: regimen._id.to_s }
      new_count = Regimen.count
      expect(response.status).to eq(200)
      expect(old_count).to be > new_count
      expect { regimen.reload }
        .to(raise_error(Mongoid::Errors::DocumentNotFound))
    end
  end
end
