module Users
  class Destroy < Mutations::Command
    include Users::PasswordHelpers

    required do
      model :user, class: User
      string :password
    end

    def validate
      confirm_password(user, password)
    end

    def execute
      user.delay.destroy!
    end
  end
end
