require_relative "../../lib/hstore_filter"

module Api
  class PointsController < Api::AbstractController
    # NOTE: Soft deleted points will be destroyed
    # without warning when the device hits
    # Points::Create::POINT_SOFT_LIMIT
    HARD_DELETE_AFTER = 2.months

    # "?filter=all", "?filter=old", "?filter=kept"
    ARCHIVAL_SCOPES = {
                        "all" => Point.all,
                        "old" => Point.discarded,
                        "kept" => Point.kept,
                      }

    def index
      Point
        .discarded
        .where("discarded_at < ?", Time.now - HARD_DELETE_AFTER)
        .destroy_all

      render json: points(params.fetch(:filter) { "all" })
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
      mutate Points::Destroy.run({ point_ids: ids }, device_params)
    end

    private

    def point
      @point ||= points.find(params[:id])
    end

    def points(filter = params[:filter])
      @points ||=
        (ARCHIVAL_SCOPES[filter] || ARCHIVAL_SCOPES["all"]).where(device_params)
    end

    def device_params
      @device_params ||= { device: current_device }
    end
  end
end
