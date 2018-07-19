module WebcamFeeds
  Destroy = CreateDestroyer.run!(resource:      WebcamFeed,
                                 singular_name: "webcam_feed")
end
