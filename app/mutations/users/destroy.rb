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
      user.device.update!(mounted_tool_id: nil)
      user.device.folders.update_all(parent_id: nil)
      user.delay.destroy!
    end
  end
end
