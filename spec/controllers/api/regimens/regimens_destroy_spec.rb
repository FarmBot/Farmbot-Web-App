describe Api::RegimensController do

  include Devise::Test::ControllerHelpers

  describe '#index' do
    let(:user) { FactoryGirl.create(:user) }
    let!(:regimen) { FactoryGirl.create(:regimen, device: user.device) }

    it 'retrieves all regimina' do
      sign_in user
      old_count = Regimen.count
      delete :destroy, { id: regimen.id }
      new_count = Regimen.count
      expect(response.status).to eq(200)
      expect(old_count).to be > new_count
      expect { regimen.reload }
        .to(raise_error(ActiveRecord::RecordNotFound))
    end
  end
end
