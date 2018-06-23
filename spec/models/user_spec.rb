describe User do
  it "lazily instantiates an admin user" do
    admin = User.admin_user
    expect(admin).to be_kind_of(User)
    expect(admin.valid_password?(ENV["ADMIN_PASSWORD"])).to eq(true)
  end

  describe "#new" do
    it "Creates a new user" do
      expect(User.new).to be_kind_of(User)
    end
  end

  around(:each) do |example|
    original = User::SKIP_EMAIL_VALIDATION
    example.run
    const_reassign(User, :SKIP_EMAIL_VALIDATION, original)
  end

  describe "SKIP_EMAIL_VALIDATION" do
    let (:user) { FactoryBot.create(:user, confirmed_at: nil) }

    it "considers al users verified when set to `true`" do
      const_reassign(User, :SKIP_EMAIL_VALIDATION, true)
      expect(user.verified?).to be(true)
    end

    it "does not skip when false" do
      const_reassign(User, :SKIP_EMAIL_VALIDATION, false)
      expect(user.verified?).to be(false)
    end
  end
end
