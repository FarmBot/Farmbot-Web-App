module Api
  class ToolsController < Api::AbstractController
    def index
      render json: tools
    end

    def show
        raise "Not implemented yet"
    end

    def destroy
        raise "Not implemented yet"
    end

    def create
        raise "Not implemented yet"
    end

    def update
        raise "Not implemented yet"
    end

private

    def q
      @q ||= ToolBay::DeviceQuery.new(current_device)
    end

    def tools
      q.tools
    end

  end
end