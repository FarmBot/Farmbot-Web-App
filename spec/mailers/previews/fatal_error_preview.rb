# Preview all emails at http://localhost:3000/rails/mailers/fatal_error
class FatalErrorPreview < ActionMailer::Preview
  def fatal_error
    device = Device.last
    log    = Logs::Create.run!({
      device:   device,
      message:  "Please login to the web application to "\
                "Unlock your device once you've verified"\
                " there are no issues with your hardware"\
                " and software configuration.",
      channels: ["fatal_email"],
      meta: {
          type:          "error",
          x:             0,
          y:             0,
          z:             0,
          verbosity:     0,
          major_version: 0,
          minor_version: 0
        }
      })
    log.save!
    FatalErrorMailer.fatal_error(device, log)
  end
end
