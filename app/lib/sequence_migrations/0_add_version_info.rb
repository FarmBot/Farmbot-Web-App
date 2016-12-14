# Background:
# This was the first migration created.
# It will attach a version number of "0" to any sequence which is not under a
# version control scheme. Nothing else.
class AddVersionInfo < SequenceMigration
  VERSION = 0

  def up
      # Since we're only incrementing the version, and because versions are
      # auto incremented after running up(), there is nothing to do here.
  end
end