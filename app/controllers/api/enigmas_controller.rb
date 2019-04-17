module Api
  class EnigmasController < Api::AbstractController
    def index
      render json: current_device.enigmas
    end

    def destroy
      mutate Enigmas::Destroy.run(enigma: enigma)
    end

    private

    def enigma
      @enigma ||= current_device.enigmas.find(params[:id])
    end
  end
end
