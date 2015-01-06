
describe User do
  describe '#new' do
    it 'Creates a new user' do
      expect(User.new).to be_kind_of(User)
    end
  end
end
