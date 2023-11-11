module Api
  class DemoAccountsController < Api::AbstractController
    skip_before_action :authenticate_user!, only: :create

    def create
      mutate Users::CreateDemo.run(create_params)
    end

    private

    def create_params
      @create_params ||= {
        secret: raw_json.fetch(:secret),
        product_line: raw_json.fetch(:product_line),
       }
    end
  end
end
