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
      mutate Sequences::Destroy.run(sequence: sequence, device: current_device)
    end

    # Share your sequence with other people
    # POST /sequences/:id/publish
    def publish
      mutate Sequences::Publish.run(raw_json, sequence: sequence, device: current_device)
    end

    # Unlist your sequence.
    # POST /sequences/:id/unpublish
    def unpublish
      mutate Sequences::Unpublish.run(sequence: sequence, device: current_device)
    end

    # Upgrade someone elses sequence.
    # post /sequences/:sequence_version_id/install
    def install
      mutate Sequences::Install.run(sequence_version: sequence_version,
                                    device: current_device)
    end

    # Upgrade a sequence that already uses a sequence version.
    # post /sequences/:sequence_id/:sequence_version_id/install
    def upgrade
      mutate Sequences::Upgrade.run(sequence_version: sequence_version,
                                    sequence: sequence,
                                    device: current_device)
    end

    private

    def sequence_version
      @sequence_version ||= SequenceVersion.find(params[:id])
    end

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
