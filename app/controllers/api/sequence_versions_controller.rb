module Api
  # Unfortunately, there was a naming collision between Rails
  # and the Api::AbstractController (`Fragments` is a part of
  # Rails)
  ShowFragment = Fragments::Show

  class SequenceVersionsController < Api::AbstractController
    def show
      celery = ShowFragment.run!(owner: sequence_version)
      render json: version_meta.merge(celery)
    end

    private

    def version_meta
      {
        id: sequence_version.id,
        created_at: sequence_version.created_at,
        description: sequence_version.description,
        copyright: sequence_version.copyright,
        name: sequence_version.name,
        color: sequence_version.color,
      }
    end

    def sequence_version
      @sequence_version ||= SequenceVersion.find(params[:id])
    end
  end
end
