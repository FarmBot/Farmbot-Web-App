module Api
  class CurvesController < Api::AbstractController
    def index
      maybe_paginate current_device.curves
    end

    def show
      render json: curve
    end

    def create
      mutate Curves::Create.run(raw_json, device: current_device)
    end

    def update
      mutate Curves::Update.run(raw_json, curve: curve, device: current_device)
    end

    def destroy
      mutate Curves::Destroy.run(curve: curve, device: current_device)
    end

    private

    def curve
      @curve ||= current_device.curves.find(params[:id])
    end
  end
end
