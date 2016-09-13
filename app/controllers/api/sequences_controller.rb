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
      mutate Sequences::Create.run(params, device: current_device)
    end

    def update
      mutate Sequences::Update.run(params[:sequence],
                                    user: current_user,
                                    steps: params[:steps],
                                    sequence: sequence)
    end

    def destroy
      mutate Sequences::Delete.run(sequence: sequence, device: current_device)
    end

    private

    def sequence
      @sequence ||= Sequence.find(params[:id])
    end

    def authorize_user 
      raise Errors::Forbidden, "Not your Sequence object." if sequence.device != current_device 
    end
  end
end
 