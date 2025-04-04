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
      limit = current_device.max_log_count || Device::DEFAULT_MAX_LOGS

      # Build conditions once
      type_conditions = mt.map.with_index do |type, i|
        verbosity = conf.send("#{type}_log")
        ["(type = ? AND verbosity <= ?)", type, verbosity]
      end

      # Combine conditions efficiently
      where_clause = type_conditions.map(&:first).join(" OR ")
      where_values = type_conditions.flat_map { |c| c[1..-1] }

      # Single query with all conditions
      logs = current_device
        .logs
        .order(created_at: :desc)
        .limit(limit)
        .where(where_clause, *where_values)
        .where(search_params)

      render json: logs
    end

    def create
      mutate Logs::Create.run(raw_json, device: current_device)
    end

    def index
      render json: current_device.limited_log_list
    end

    def destroy
      if params[:id] == "all"
        render json: (current_device.logs.destroy_all && "")
      else
        render json: (current_device.logs.find(params[:id]).destroy! && "")
      end
    end

    private

    def trim_logs
      # WARNING: This is a slow method. Perform in background.
      current_device.delay.trim_excess_logs
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
