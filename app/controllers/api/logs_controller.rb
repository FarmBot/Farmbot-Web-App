module Api
  class LogsController < Api::AbstractController
    def create
      case raw_json
      when Array
        render json: raw_json
          .last(current_device.max_log_count)
          .map { |i| new_log(i) }
          .select { |i| i.success? }
          .map { |i| i.result }
          .select { |i| i.meta["type"] != "fun"}
          .tap { |i| Log.transaction { i.map(&:save) } }
      when Hash
        outcome = new_log(raw_json)
        outcome.result.save if outcome.success?
        return mutate outcome
      else
        sorry "Post a JSON array or object.", 422
      end
    end

    def index
      render json: current_device.limited_log_list
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
