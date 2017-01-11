module Api
  class ImagesController < Api::AbstractController
    def create
        mutate Images::Create.run({device: current_device}, raw_json)
    end

    def show
      render json: image
    end

    def destroy
      render json: image.destroy! && ""
    end

  private

    def image
      Image.where(device: current_device).find(params[:id])
    end
  end
end
