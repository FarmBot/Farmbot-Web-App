
# Generates a tree of all syncable resources. Typically used by a FarmBot device
# for caching of resources. 
$PROFILE = ->(marker){
  $LAST_ONE ||= Time.now
  diff = Time.now - $LAST_ONE
  puts "#{"=" * 30} (#{diff.to_s}) @#{marker.to_s}"
  $LAST_ONE = Time.now
}

module Api
  class SyncsController < Api::AbstractController

    # GET /api/sync
    def show
      $PROFILE.("ENTERING MUTATION")
      mutate Sync::Fetch.run(device: current_device).tap { $PROFILE.("EXIT MUTATION") }
    end
  end
end
