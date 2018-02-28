module Api
  class PinBindingsController < Api::AbstractController
    def index
      render json: pin_bindings
    end

    def show
      render json: pin_binding
    end

    def destroy
      mutate PinBindings::Destroy.run(pin_binding: pin_binding)
    end

    def create
      mutate PinBindings::Create.run(raw_json, device: current_device)
    end

    def update
      mutate PinBindings::Update.run(raw_json, device: current_device)
    end

private

    def pin_bindings
      PinBinding.where(device: current_device)
    end

    def pin_binding
      @pin_binding ||= pin_bindings.find(params[:id])
    end
  end
end
