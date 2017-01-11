module Api
  class ImagesController < Api::AbstractController
    def create
        mutate Images::Create.run({device: current_device}, raw_json)
    end

    def show
        raise "Pending."
    end

    def destroy
        raise "Pending."
    end
  end
end
