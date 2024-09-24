require "spec_helper"

describe Api::RmqUtilsController do
  include Devise::Test::ControllerHelpers
  pass = "password123"

  let :user do
    FactoryBot.create(:user, password: pass, password_confirmation: pass)
  end

  let :credentials do
    p = { email: user.email,
          password: pass,
          fbos_version: Gem::Version.new("99.99.99") }
    token = Auth::CreateToken.run!(p)[:token].encoded
    { username: "device_#{user.device.id}",
      password: token }
  end

  before(:each) { destroy_everything! }

  it "Stops access to `#terminal_input` if no `staff` tokens in use" do
    username = credentials.fetch(:username)
    real_routing_key = "bot.#{username}.terminal_input"
    [
      real_routing_key,
      "bot.#{username}.terminal_input.123",
      "bot.device_999.terminal_input.*",
    ].map do |routing_key|
      p = credentials.merge(routing_key: routing_key, permission: "write")
      post :topic_action, params: p
      expect(response.body).to eq("deny")
      expect(response.status).to eq(403)
    end
  end

  it "allows staff access to `#terminal_input`" do
    TokenIssuance.create!(device_id: user.device.id,
                          exp: 5.minutes.from_now.to_i,
                          jti: SecureRandom.uuid,
                          aud: "staff")
    username = credentials.fetch(:username)
    routing_key = "bot.#{username}.terminal_input"
    p = credentials.merge(routing_key: routing_key, permission: "write")
    post :topic_action, params: p
    expect(response.body).to eq("allow")
    expect(response.status).to eq(200)
  end

  it "limits users to 20 connections per 5 minutes" do
    empty_mail_bag
    u = credentials.fetch(:username)
    p = credentials.fetch(:password)
    Rails
      .cache
      .redis
      .set("mqtt_limiter:" + u.split("_").last, 0)

    20.times do
      post :user_action, params: { username: u, password: p }
      expect(response.status).to eq(200)
      expect(response.body).to include("allow")
    end

    run_jobs_now do
      post :user_action, params: { username: u, password: p }
      expect(response.status).to eq(403)
      expect(response.body).not_to include("allow")
    end
  end

  it "reports people trying to use ADMIN_PASSWORD on non-local servers" do
    k = "ADMIN_PASSWORD"
    old_pw = ENV[k]
    ENV.delete(k)

    post :user_action, params: { username: "admin", password: old_pw }
    expect(response.status).to eq(403)
    expect(response.body).not_to include("allow")

    ENV[k] = old_pw
  end

  it "allows admins to do anything" do
    all =
      [:user_action, :vhost_action, :resource_action, :topic_action]
    all.map do |action|
      post action, params: { username: "admin",
                             password: ENV.fetch("ADMIN_PASSWORD") }
      expect(response.status).to eq(200)
      expect(response.body).to include("allow")
    end
  end

  it "denies public_broadcast write access to non-admin users" do
    routing_key = Api::RmqUtilsController::PUBLIC_CHANNELS.sample
    permission = ["write", "configure"].sample
    p = credentials.merge(routing_key: routing_key, permission: permission)
    post :topic_action, params: p
    expect(response.body).to eq("deny")
    expect(response.status).to eq(403)
  end

  it "allows public_broadcast read access to non-admin users" do
    routing_key = Api::RmqUtilsController::PUBLIC_CHANNELS.sample
    permission = "read"
    p = credentials.merge(routing_key: routing_key, permission: permission)
    post :topic_action, params: p
    expect(response.body).to eq("allow")
    expect(response.status).to eq(200)
  end

  it "allows access to ones own topic" do
    p = credentials.merge(routing_key: "bot.#{credentials[:username]}.logs")
    post :topic_action, params: p
    expect(response.body).to include("allow")
    expect(response.status).to eq(200)
  end

  it "denies invalid topics" do
    post :topic_action, params: credentials.merge(routing_key: "*")
    expect(response.body).to include("malformed topic")
    expect(response.status).to eq(422)
  end

  it "denies viewing other people's topics" do
    p = credentials.merge(routing_key: "bot.device_0.from_device")
    post :topic_action, params: p
    expect(response.body).to include("deny")
    expect(response.status).to eq(403)
  end

  it "always denies guest users" do
    no_no_no =
      { username: "guest",  # RabbitMQ Default user.
        password: "guest" } # RabbitMQ Default user.
    post :user_action, params: no_no_no
    expect(response.body).to include("deny")
    expect(response.status).to eq(403)
  end

  it "`allow`s admin users when ADMIN_PASSWORD is provided" do
    admin_params = { username: "admin",
                     password: ENV.fetch("ADMIN_PASSWORD") }
    post :user_action, params: admin_params
    expect(response.body).to include("allow")
    expect(response.status).to eq(200)
  end

  it "denies admin users when ADMIN_PASSWORD is wrong" do
    # If this test fails, something *very* bad is happening. - RC
    bad_pw = ENV.fetch("ADMIN_PASSWORD").reverse + "X"
    admin_params = { username: "admin", password: bad_pw }
    post :user_action, params: admin_params
    expect(response.body).to include("deny")
    expect(response.status).to eq(403)
  end

  it "`allow`s end users and farmbots when JWT is provided" do
    post :user_action, params: credentials
    expect(response.body).to include("allow")
    expect(response.status).to eq(200)
  end

  it "`deny`s end users and farmbots when JWT is provided" do
    credentials[:password] = credentials[:password].reverse + "X"
    post :user_action, params: credentials
    expect(response.status).to eq(401)
    expect(json[:error]).to include("failed to authenticate")
  end

  it "`deny`s users who try spoofing usernames" do
    credentials[:username] = "device_0"
    post :user_action, params: credentials
    expect(response.status).to eq(403)
    expect(response.body).to include("deny")
  end

  it "validates vHost" do
    vhost = Api::RmqUtilsController::VHOST
    post :vhost_action, params: credentials.merge(vhost: vhost)
    expect(response.status).to eq(200)
    expect(response.body).to include("allow")
  end

  it "invalidates vHost" do
    vhost = Api::RmqUtilsController::VHOST + "NO"
    post :vhost_action, params: credentials.merge(vhost: vhost)
    expect(response.status).to eq(403)
    expect(response.body).to include("deny")
  end

  it "allows RMQ resource usage" do
    post :resource_action, params: credentials.merge({
                             resource: Api::RmqUtilsController::RESOURCES.sample,
                             permission: Api::RmqUtilsController::PERMISSIONS.sample,
                           })
    expect(response.status).to eq(200)
    expect(response.body).to include("allow")
  end

  it "denies RMQ resource usage" do
    post :resource_action, params: credentials.merge({ resource: "something_else",
                                                       permission: "something_else" })
    expect(response.status).to eq(403)
    expect(response.body).to include("deny")
  end

  def random_channel(extra_stuff = "")
    "bot.device_#{rand(1..9999)}" + extra_stuff
  end

  it "validates topic names" do
    r = Api::RmqUtilsController::DEVICE_SPECIFIC_CHANNELS
    ["*",
     "#",
     "foo",
     "foo.*",
     "bot.*",
     random_channel,
     random_channel(".nope"),
     random_channel(".status_v3.*"),
     random_channel(".status_v3")].map { |x| expect(x.match(r)).to be(nil) }

    [".from_api.*",
     ".from_api",
     ".from_clients.*",
     ".from_clients",
     ".from_device.*",
     ".from_device",
     ".logs.*",
     ".logs",
     ".status.*",
     ".status",
     ".sync.*",
     ".telemetry.*",
     ".telemetry",
     ".sync"].map { |x| expect(random_channel(x).match(r)).to be }
  end

  it "allows farmbot_guest users, regardless of password" do
    p = { username: "farmbot_demo", password: SecureRandom.alphanumeric }
    post :user_action, params: p
    expect(response.status).to eq(200)
    expect(response.body).to eq("allow")
  end

  it "allows expected farmbot_guest topics" do
    p = {
      username: "farmbot_demo",
      permission: "read",
      routing_key: "demos.d3f91ygdrajxn8jk",
    }
    post :topic_action, params: p
    expect(response.body).to(eq("allow"))
    expect(response.status).to eq(200)
  end

  sneaky_topics = ["demos",
                   "demos.#",
                   "demos.*",
                   "demos.#.#",
                   "demos.*.*",
                   "demos.#.*",
                   "demos.*.#",
                   "demos.#.d3f91ygdrajxn8jk",
                   "demos.*.d3f91ygdrajxn8jk",
                   "demos.d3f91ygdrajxn8jk.#",
                   "demos.d3f91ygdrajxn8jk.*",
                   "demos.d3f91ygdrajxn8jk.d3f91ygdrajxn8jk",
                   nil]

  device_8 = "device_#{FactoryBot.create(:device).id}"
  possible_attackers = [
    # ["username", "permission"]
    ["farmbot_demo", "read"],
    ["farmbot_demo", "write"],
    ["farmbot_demo", "configure"],
    ["farmbot_demo", nil],
    [device_8, "read"],
    [device_8, "write"],
    [device_8, "configure"],
    [device_8, nil],
  ]
  TEST_NAME_TPL = "%{username} %{permission}-ing %{routing_key}"
  possible_attackers.map do |(username, permission)|
    sneaky_topics.map do |topic|
      p = { username: username, permission: permission, routing_key: topic }
      it(TEST_NAME_TPL % p) do
        post :topic_action, params: p
        if response.status == 422
          expect(response.body).to(include("malformed"))
        else
          expect(response.body).to(eq("deny"))
          expect(response.status).to eq(403)
        end
      end
    end
  end
end
