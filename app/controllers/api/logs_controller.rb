module Api
  class LogsController < Api::AbstractController
    def create
      case raw_json
      when Array
        raise "BRB"
      when Hash
        return mutate Logs::Create.run(raw_json,
                                       device: current_device)
      else
        sorry "Post a JSON array or object.", 422
      end
    end

    def index
      render json: current_device.logs.last(25)
    end
  end
end
