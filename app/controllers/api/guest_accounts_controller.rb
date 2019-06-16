module Api
  class GuestAccountsController < Api::AbstractController
    skip_before_action :authenticate_user!, only: :create

    def create
      raise "NOT IMPLEMENTED"
    end
  end
end
