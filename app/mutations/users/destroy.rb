module Users
  class Destroy < Mutations::Command
    BAD_PASSWORD = "Password does not match"

    required do
      model :user, class: User
      string :password
    end

    def validate
      confirm_password
    end

    def execute
      user.destroy!
    end

private

    def confirm_password
      invalid = !user.valid_password?(password)
      add_error :password, :*, BAD_PASSWORD if invalid
    end
  end
end
