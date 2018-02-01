module Api
  class SequencesController < Api::AbstractController
    before_action :authorize_user, except: [:index, :create]
    before_action :clean_expired_farm_events, only: [:destroy]

    def index
      render json: Sequence
        .where(device: current_device)
        .to_a
        .map { |s| CeleryScript::FetchCelery.run!(sequence: s) }
    end

    def show
      render json: sequence
    end

    def create
      mutate Sequences::Create.run(sequence_params, device: current_device)
    end

    def update
      mutate Sequences::Update.run(sequence_params,
                                    device: current_device,
                                    sequence: sequence)
    end

    def destroy
      mutate Sequences::Delete.run(sequence: sequence, device: current_device)
    end

    private

    def maybe_migrate(sequences)
    end

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
