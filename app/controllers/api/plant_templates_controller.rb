module Api
  class PlantTemplatesController < Api::AbstractController
    def index
      maybe_paginate current_device.plant_templates
    end

    def create
      mutate PlantTemplates::Create.run(raw_json, device: current_device)
    end

    def update
      mutate PlantTemplates::Update.run(raw_json,
                                        plant_template: plant_template,
                                        device: current_device)
    end

    def destroy
      render json: plant_template.destroy! && ""
    end

    private

    def plant_templates
      @plant_templates ||= current_device.plant_templates
    end

    def plant_template
      @plant_template ||= plant_templates.find(params[:id])
    end
  end
end
