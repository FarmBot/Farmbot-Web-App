module Api
  class AiFeedbacksController < Api::AbstractController
    def create
      render json: AiFeedback.create!(update_params.merge(
        model: ENV["OPENAI_MODEL_LUA"],
        temperature: ENV["OPENAI_API_TEMPERATURE"]
      ))
    end

    private

    def update_params
      raw_json.merge(device_id: current_device.id)
    end
  end
end
