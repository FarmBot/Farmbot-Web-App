module Api
  class WizardStepResultsController < Api::AbstractController
    def index
      maybe_paginate wizard_step_results
    end

    def create
      render json: WizardStepResult.create!(update_params)
    end

    def update
      wizard_step_result.update!(update_params)
      render json: wizard_step_result
    end

    def destroy
      wizard_step_result.destroy!
      render json: ""
    end

    private

    def update_params
      raw_json.merge(device_id: current_device.id)
    end

    def wizard_step_result
      @wizard_step_result ||= wizard_step_results.find(params[:id])
    end

    def wizard_step_results
      @wizard_step_results ||= current_device.wizard_step_results
    end
  end
end
