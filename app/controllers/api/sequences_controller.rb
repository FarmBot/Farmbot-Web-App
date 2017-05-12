module Api
  class SequencesController < Api::AbstractController
    include Skylight::Helpers

    before_action :authorize_user, except: [:index, :create]
    before_action :clean_expired_farm_events, only: [:destroy]

    def index
      query = { device: current_device }
      query.merge!(farm_event_id: params[:farm_event_id]) if params[:farm_event_id]
      sequences = Sequence.where(query)
      render json: sequences
    end

    def show
      render json: sequence
    end

    def create
      mutate Sequences::Create.run(sequence_params, device: current_device)
    end

    instrument_method
    def update
      mutate Sequences::Update.run(sequence_params, # params[:sequence].as_json,
                                   device: current_device,
                                   sequence: sequence)
    end

    def destroy
      mutate Sequences::Delete.run(sequence: sequence, device: current_device)
    end

    private

    def maybe_migrate(sequences)
    end

    instrument_method
    def sequence_params
        @sequence_params ||= raw_json[:sequence] || raw_json || {}
    end

    def sequence
      @sequence ||= Sequence.find(params[:id])
    end

    def authorize_user
      raise Errors::Forbidden,
            "Not your Sequence object." if sequence.device != current_device
    end
  end
end
