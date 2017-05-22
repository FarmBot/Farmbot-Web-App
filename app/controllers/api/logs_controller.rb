module Api
  class LogsController < Api::AbstractController
    include Skylight::Helpers

    def create
      case raw_json
      when Array
        render json: raw_json
          .last(current_device.max_log_count)
          .map    { |i| new_log(i) }
          .select { |i| i.success? }             # Ignore rejects
          .map    { |i| i.result }
          .select { |i| i.meta["type"] != "fun"} # Don't save jokes
          .map    { |i| i.as_json }
          .tap    { |i| Log.create(i) }
      when Hash
        outcome = new_log(raw_json)
        outcome.result.save if outcome.success?
        return mutate outcome
      else
        sorry "Post a JSON array or object.", 422
      end
    end

    instrument_method
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
