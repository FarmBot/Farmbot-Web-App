module Api
  class SequencesController < Api::AbstractController
    before_action :authorize_user, except: [:index, :create]

    def index
      query = { device: current_device }
      query.merge!(schedule_id: params[:schedule_id]) if params[:schedule_id]
      render json: Sequence.where(query)
    end

    def show
      render json: sequence
    end

    def create
      mutate Sequences::Create.run(sequence_i_guess, device: current_device)
    end

    def update
      mutate Sequences::Update.run(sequence_i_guess, # params[:sequence].as_json,
                                   device: current_device,
                                   sequence: sequence)
    end

    def destroy
      mutate Sequences::Delete.run(sequence: sequence, device: current_device)
    end

    private

    # TODO: Come back and fix this. Rails 5 has changed the way it handles
    # params.
    def sequence_i_guess
      JSON.parse(request.body.read)["sequence"] || {}
    rescue JSON::ParserError => e
      raise OnlyJson
    end

    def sequence
      @sequence ||= Sequence.find(params[:id])
    end

    def authorize_user 
      raise Errors::Forbidden, "Not your Sequence object." if sequence.device != current_device 
    end
  end
end
 