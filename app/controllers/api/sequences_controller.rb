module Api
  class SequencesController < Api::AbstractController
    PUBLIC_SEQUENCES            = Sequence
                                    .with_usage_reports
                                    .where(is_public: true)
    SERIALIZED_PUBLIC_SEQUENCES = PUBLIC_SEQUENCES.to_a.map do |s|
      CeleryScript::FetchCelery.run!(sequence: s)
    end

    before_action :clean_expired_farm_events, only: [:destroy]

    def index
      render json: sequences
        .to_a
        .map { |s| CeleryScript::FetchCelery.run!(sequence: s) }
        .concat(PUBLIC_SEQUENCES)
    end

    def show # TODO:
      s = sequences.or(PUBLIC_SEQUENCES).find(params[:id])
      render json: CeleryScript::FetchCelery.run!(sequence: s)
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
      @sequences ||= Sequence.with_usage_reports.where(device: current_device)
    end

    def sequence
      @sequence ||= sequences.find(params[:id])
    end
  end
end
