require_relative "../../lib/hstore_filter"

module Api
  class PointsController < Api::AbstractController
    # Hard delete soft deletions after ___:
    EXPIRY           = 2.months

    def index
      Point.discarded.where("discarded_at < ?", Time.now - EXPIRY).destroy_all
      render json: points
    end

    def show
      render json: points.find(params[:id])
    end

    def search
      mutate Points::Query.run(raw_json, points: points)
    end

    def create
      mutate Points::Create.run(raw_json, device_params)
    end

    def update
      mutate Points::Update.run(raw_json, { point: point }, device_params)
    end

    def destroy
      # TODO: We don't need to do batch requests like this any more.
      # This should be removed when possible. -RC 1 AUG 2018
      ids = params[:id].to_s.split(",").map(&:to_i)
      mutate Points::Destroy.run({point_ids: ids}, device_params)
    end

  private

    def point
      @point ||= points.find(params[:id])
    end

    def points
      @points ||= unrestricted_archival_scope.where(device_params)
    end

    def unrestricted_archival_scope
      case params[:filter]
      when "all" then return Point.all
      when "old" then return Point.discarded
      else
        return Point.kept
      end
    end

    def device_params
      @device_params ||= {device: current_device}
    end
  end
end
