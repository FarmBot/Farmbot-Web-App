module Auth
  module ConsentHelpers
    def maybe_validate_tos
      return  unless User::ENFORCE_TOS # Not every server has a TOS.
      no_tos! unless agree_to_terms
    end

    def no_tos!
      add_error :terms_of_service, :consent, "you must agree to the terms of use."
    end
  end
end
