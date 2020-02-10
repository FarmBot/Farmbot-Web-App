module Api
  class FarmwareInstallationsController < Api::AbstractController
    def index
      maybe_paginate farmware_installations
    end

    def show
      render json: farmware_installation
    end

    def destroy
      farmware_installation.destroy!
      render json: ""
    end

    # Perform HTTP post to this endpoint when you
    # need to force an update.
    def refresh
      farmware_installation.force_package_refresh!
      render json: farmware_installation
    end

    def create
      mutate FarmwareInstallations::Create.run(raw_json, device: current_device)
    end

private

    def farmware_installations
      FarmwareInstallation.where(device: current_device)
    end

    def farmware_installation
      @farmware_installation ||= farmware_installations.find(params[:id])
    end
  end
end
