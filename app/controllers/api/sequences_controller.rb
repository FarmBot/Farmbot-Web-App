module Api
  class SequencesController < Api::AbstractController
    before_action :clean_expired_farm_events, only: [:destroy]

    def index
      render json: sequences
        .to_a
        .map { |s| CeleryScript::FetchCelery.run!(sequence: s) }
    end

    def show
      render json: CeleryScript::FetchCelery.run!(sequence: sequence)
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

    def sequence_params
        @sequence_params ||= raw_json[:sequence] || raw_json || {}
    end

    def sequences
      puts "TODO- maybe I need to do a raw SQL query here ? Hmmm..."
      @sequences ||= Sequence
                      .includes(:primary_nodes, :edge_nodes)
                      .where(device: current_device)
    end

    def sequence
      @sequence ||= sequences.find(params[:id])
    end
  end
end
