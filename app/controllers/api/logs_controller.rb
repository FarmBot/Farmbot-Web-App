module Api
  class LogsController < Api::AbstractController
    def create
      case raw_json
      when Array
        # TODO: PROBLEM: If you post an Array, and that array is full of garbage
        # data, the API returns a 200 OK (and an array of error explanations).
        # This is not RESTful. Will fix later.
        # TODO Create in batches if this becomes a perf. bottleneck.
        render json: raw_json
          .last(current_device.max_log_count)
          .map { |i| new_log(i) }
          .select { |i| i.success? }
          .map { |i| i.result }
          .tap { |i| Log.transaction { i.map(&:save) } }
          .tap { current_device.limit_log_length }
      when Hash
        outcome = new_log(raw_json)
        outcome.result.save if outcome.success?
        return mutate outcome
      else
        sorry "Post a JSON array or object.", 422
      end
    end

    def index
      render json: current_device.logs.last(25)
    end

    def destroy
      render json: current_device.logs.destroy_all && ""
    end

private

    def new_log(input)
      Logs::Create.run(input, device: current_device)
    end
  end
end
