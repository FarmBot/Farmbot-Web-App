module Users
  module EmailDomainHelpers
    CANT_USE_SERVER = "You are not authorized to use this server. " \
                      "Please use an official email address."
    INVALID_EMAIL = "Please enter a valid email address."

    def allowed_domains
      @allowed_domains ||= ENV["TRUSTED_DOMAINS"].split(",").map(&:strip)
    end

    def actual_domain
      @actual_domain ||= email.split("@").last
    end

    def domain_is_ok?
      ENV["TRUSTED_DOMAINS"] ? allowed_domains.include?(actual_domain) : true
    end

    def email_is_ok?
      URI::MailTo::EMAIL_REGEXP.match?(email)
    end

    def you_cant_use_this_server
      add_error :email, :email, CANT_USE_SERVER
    end

    def maybe_check_email_domain
      you_cant_use_this_server unless domain_is_ok?
    end

    def maybe_check_email
      unless email_is_ok?
        add_error :email, :format, INVALID_EMAIL
        return
      end

      maybe_check_email_domain
    end
  end
end
