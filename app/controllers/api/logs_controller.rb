module Api
  class LogsController < Api::AbstractController
    def create
      case raw_json
      when Array
        # TODO: PROBLEM: If you post an Array, and that array is full of garbage
        # data, the API returns a 200 OK (and an array of error explanations).
        # This is not RESTful. Will fix later.
        render json: raw_json
          .map { |i| new_log(i) }
          .map { |i| i.success? ? i : i.errors.message }
      when Hash
        return mutate new_log(raw_json)
      else
        sorry "Post a JSON array or object.", 422
      end
    end

    def index
      render json: current_device.logs.last(25)
    end

private

    def new_log(input)
      Logs::Create.run(input, device: current_device)
    end
  end
end
