module PasswordResets
  class Create < Mutations::Command
    required do
      string :email
    end

    def execute
      PasswordResetJob.perform_later(normalized_email)
      # Under no circumstance should you return the token.
      return { status: "Check your email!" }
    end

    private

    def normalized_email
      @normalized_email ||= email.strip.downcase
    end
  end
end
