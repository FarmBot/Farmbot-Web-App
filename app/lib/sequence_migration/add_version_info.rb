module SequenceMigration
  # Background:
  # This was the first migration created.
  # It will attach a version number of "0" to any sequence which is not under a
  # version control scheme. Nothing else.
  class AddVersionInfo < Base
    VERSION = 0
    CREATED_ON = "DECEMBER 15 2016"
    def up
        # Since we're only incrementing the version, and because versions are
        # auto incremented after running up(), there is nothing to do here.
        Rollbar.info "Sequence ##{sequence.id} on #{$API_URL} was versionless!"
    end
  end
end
