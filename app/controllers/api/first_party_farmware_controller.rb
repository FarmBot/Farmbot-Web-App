module Api
  class FirstPartyFarmwareController < Api::AbstractController
    UPDATED_AT = Date.parse("2019-08-06T18:31:28.099Z")
    STUBS = {
      "take-photo" => "https://raw.githubusercontent.com/FarmBot-Labs/farmware_manifests/master/packages/take-photo/manifest_v2.json",
      "camera-calibration" => "https://raw.githubusercontent.com/FarmBot-Labs/farmware_manifests/master/packages/camera-calibration/manifest_v2.json",
      "plant-detection" => "https://raw.githubusercontent.com/FarmBot-Labs/farmware_manifests/master/packages/plant-detection/manifest_v2.json",
      "historical-camera-calibration" => "https://raw.githubusercontent.com/FarmBot-Labs/farmware_manifests/master/packages/historical-camera-calibration/manifest_v2.json",
      "historical-plant-detection" => "https://raw.githubusercontent.com/FarmBot-Labs/farmware_manifests/master/packages/historical-plant-detection/manifest_v2.json",
    }
      .to_a
      .each_with_index
      .map do |(package, url), id|
      {
        id: (id + 1).to_s,
        created_at: UPDATED_AT,
        updated_at: UPDATED_AT,
        url: url,
        package: package,
        package_error: nil,
      }.with_indifferent_access
    end.index_by { |x| x.fetch(:id) }

    def index
      render json: STUBS
    end

    def show
      render json: STUBS.fetch(params[:id])
    end
  end
end
