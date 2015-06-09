require 'mutations/time_filter'

module Auth
  class Create < Mutations::Command
    required do
      string :bot_token
      string :bot_uuid
    end

    def validate
      @user = Device.find_by(uuid: bot_uuid, token: bot_token).user
    rescue Mongoid::Errors::DocumentNotFound
      add_error :auth, 'bad uuid or token'
    end

    def execute
      @user
    end
  end
end
