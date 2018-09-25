require "spec_helper"

describe NervesHub do
  it "generates HTTP failure messages" do
    status = "800"
    msg    = "failed to reticulate splines."
    expect { NervesHub.bad_http(status, msg) }
      .to raise_error(NervesHub::NervesHubHTTPError)
  end
end
