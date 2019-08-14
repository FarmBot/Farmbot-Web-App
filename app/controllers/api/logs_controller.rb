module Api
  class LogsController < Api::AbstractController
    before_action :trim_logs

    SEARCH_FIELDS = {
      message: :to_s,
      type: :to_s,
      verbosity: :to_i,
      x: :to_f,
      y: :to_f,
      z: :to_f,
    }

    def search
      conf = current_device.web_app_config
      mt = CeleryScriptSettingsBag::ALLOWED_MESSAGE_TYPES
      query = mt
        .map { |x| "(type = '#{x}' AND verbosity <= ?)" }
        .join(" OR ")
      conditions = mt.map { |x| "#{x}_log" }.map { |x| conf.send(x) }
      args_ = conditions.unshift(query)
      limit = current_device.max_log_count || Device::DEFAULT_MAX_LOGS

      render json: current_device
               .logs
               .order(created_at: :desc)
               .where(*args_)
               .limit(limit)
               .where(search_params)
    end

    def create
      mutate Logs::Create.run(raw_json, device: current_device)
    end

    def index
      render json: current_device.limited_log_list
    end

    # Clears out *all* logs.
    def destroy
      render json: current_device.logs.destroy_all && ""
    end

    private

    def trim_logs
      # WARNING: Calls to `destroy_all` rather than
      #   `delete_all` can be disastrous- this is
      #   a big table! RC
      current_device.excess_logs.delete_all
    end

    def search_params
      SEARCH_FIELDS.reduce({}) do |acc, (k, v)|
        search_term = params[k]
        if search_term
          acc[k] = search_term.send(v)
        end
        acc
      end
    end
  end
end
