module Auth
  # The API supports a number of authentication strategies (Cookies, Bot token,
  # JWT). This service helps determine which auth strategy to use.
  class DetermineAuthStrategy < Mutations::Command
    optional do
      string :jwt
      string :bot_token
      model  :user, class: User
    end

    def execute
      # Priority matters here for JWT vs. bot.
      # That's because current_user always has a current_device, but not the
      # other way around, so JWT should get higher preference.
      return :already_connected if user
      return :jwt               if jwt
      return :bot               if bot_token
      return nil                # Failure case- can't determine.
    end
  end
end
