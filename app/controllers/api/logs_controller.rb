module Api
  class LogsController < Api::AbstractController
    def search
      conf       = current_device.web_app_config
      mt         = CeleryScriptSettingsBag::ALLOWED_MESSAGE_TYPES
      query      = mt
                    .map { |x| "(type = '#{x}' AND verbosity <= ?)" }
                    .join(" OR ")
      conditions = mt.map { |x| "#{x}_log" }.map{|x| conf.send(x) }
      args_      = conditions.unshift(query)
      limit      = current_device.max_log_count || Device::DEFAULT_MAX_LOGS

      render json: current_device.logs.where(*args_).limit(limit)
    end

    # This is one of the "oddball" endpoints for the FarmBot API.
    # It is unique because it allows batch creation of logs.
    # When creating in batches, it is a "best effort" approach.
    # If some logs fail to save, they will fail silently.
    # As a matter of policy, not all log types are stored in the DB.
    def create
      case raw_json
      when Array then handle_many_logs
      when Hash  then handle_single_log
      end
    end

    def index
      render json: current_device.limited_log_list
    end

    # Clears out *all* logs.
    def destroy
      render json: current_device.logs.destroy_all && ""
    end

private

    def clean_out_old_ones
      current_device
        .logs
        .where
        .not(id: current_device.limited_log_list.pluck(:id))
        .delete_all
    end

    def handle_many_logs
      mutate Logs::BatchCreate.run(device: current_device, logs: raw_json)
    end

    def handle_single_log
      outcome = Logs::Create.run(raw_json, device: current_device)
      if outcome.success?
        outcome.result.save!
        maybe_deliver(outcome.result)
      end
      mutate outcome
    end

    def maybe_deliver(log_or_logs)
      LogDispatch.delay.deliver(current_device, log_or_logs)
    end
  end
end
