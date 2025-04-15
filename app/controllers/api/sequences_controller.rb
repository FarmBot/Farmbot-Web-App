module Api
  class SequencesController < Api::AbstractController
    include ActionController::Live

    before_action :clean_expired_farm_events, only: [:destroy]

    def index
      # Stream to reduce memory usage
      response.headers['Content-Type'] = 'application/json'
      response.headers['Cache-Control'] = 'no-cache'
      response.stream.write '['

      Sequence.where(device: current_device)
              .includes(:sequence_publication, :sequence_version)
              .each_with_index do |s, index|
        # Load the sequence with all needed associations and convert to JSON
        seq_json = Sequences::Show.run!(sequence: Sequence.with_usage_reports.find(s.id)).to_json
        # Append a comma for all but the first element to maintain valid JSON syntax
        response.stream.write ',' unless index.zero?
        response.stream.write seq_json
      end

      response.stream.write ']'
    ensure
      response.stream.close
    end

    def show
      render json: Sequences::Show.run!(sequence: sequence)
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
      mutate Sequences::Publish.run(copyright: params[:copyright],
                                    sequence: sequence,
                                    device: current_device)
    end

    # Unlist your sequence.
    # POST /sequences/:id/unpublish
    def unpublish
      mutate Sequences::Unpublish.run(sequence: sequence, device: current_device)
    end

    # Install someone elses sequence.
    # post /sequences/:sequence_version_id/install
    def install
      mutate Sequences::Install.run(sequence_version: sequence_version,
                                    device: current_device)
    end

    # Upgrade a sequence that already uses a sequence version.
    # post /sequences/:id/upgrade/:sequence_version_id
    def upgrade
      mutate Sequences::Upgrade.run(sequence_version: sequence_version,
                                    sequence: sequence,
                                    device: current_device)
    end

    private

    def sequence_version
      @sequence_version ||= SequenceVersion.find(params[:sequence_version_id])
    end

    def sequence_params
      @sequence_params ||= raw_json[:sequence] || raw_json || {}
    end

    # Retrieve a single sequence record directly associated with the current device
    def sequence
      @sequence ||= Sequence.with_usage_reports.find_by!(id: params[:id], device: current_device)
    end
  end
end
