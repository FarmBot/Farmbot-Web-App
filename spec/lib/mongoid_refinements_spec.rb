class TestCreateMutation < Mutations::Command
  using LegacyRefinementsModule
  def execute
    create(User, {})
  end
end

class TestUpdateMutation < Mutations::Command
  using LegacyRefinementsModule
  required do
    model :user, class: User
  end

  def execute
    update_attributes user, email: nil
  end
end

RSpec.describe LegacyRefinementsModule do
  describe '#create' do
    it 'catches model errors' do
      mutation = TestCreateMutation.run({})
      expect(mutation.success?).to be_falsey
      email_error = mutation.errors.message[:user][:email]
      expect(email_error).to include("can't be blank")
    end
  end

  describe '#update' do
    it 'catches model errors' do
      mutation = TestUpdateMutation.run(user: FactoryGirl.create(:user))
      expect(mutation.success?).to be_falsey
      email_error = mutation.errors.message[:user][:email]
      expect(email_error).to include("can't be blank")
    end
  end
end
