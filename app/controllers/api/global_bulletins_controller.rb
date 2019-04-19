module Api
  class GlobalBulletinsController < Api::AbstractController
    skip_before_action :authenticate_user!
    skip_before_action :check_fbos_version

    def show
      render json: GlobalBulletinSerializer.new(search_results).as_json
    end

    private

    def search_results
      @search_results ||= GlobalBulletin.find_by(slug: params[:id])
    end
  end
end
